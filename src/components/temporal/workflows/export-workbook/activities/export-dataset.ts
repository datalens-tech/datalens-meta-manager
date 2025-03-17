import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import type {
    WorkbookExportEntriesData,
    WorkbookExportEntryNotifications,
} from '../../../../../db/models/workbook-export/types';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import type {ActivitiesDeps} from '../../../types';

export type ExportDatasetArgs = {
    exportId: string;
    datasetId: string;
    mockDatasetId: string;
    idMapping: Record<string, string>;
};

export const exportDataset = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {exportId, datasetId, mockDatasetId, idMapping}: ExportDatasetArgs,
): Promise<void> => {
    const {
        responseData: {dataset, notifications},
    } = await gatewayApi.bi.exportDataset({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {datasetId, idMapping},
    });

    const criticalNotifications = notifications.filter(
        ({level}) => level === NotificationLevel.Critical,
    );

    if (criticalNotifications.length > 0) {
        await WorkbookExportModel.query(WorkbookExportModel.primary)
            .patch({
                errors: raw(
                    "jsonb_set(COALESCE(??, '{}'), '{criticalNotifications}', (COALESCE(??->'criticalNotifications', '[]') || ?))",
                    [
                        ExportModelColumn.Errors,
                        ExportModelColumn.Errors,
                        {
                            entryId: datasetId,
                            notifications: criticalNotifications,
                        } satisfies WorkbookExportEntryNotifications,
                    ],
                ),
            })
            .where({
                exportId,
            });

        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `Got critical notification while exporting dataset: ${datasetId}`,
        });
    }

    const update: PartialModelObject<WorkbookExportModel> = {
        data: raw(
            "jsonb_set(??, '{datasets}', (COALESCE(??->'datasets', '{}'::jsonb) || ?::jsonb))",
            [
                ExportModelColumn.Data,
                ExportModelColumn.Data,
                {
                    [mockDatasetId]: dataset,
                } satisfies WorkbookExportEntriesData,
            ],
        ),
    };

    if (notifications.length > 0) {
        update.notifications = raw(
            "jsonb_set(COALESCE(??, '{}'), '{datasets}', (COALESCE(??->'datasets', '[]') || ?))",
            [
                ExportModelColumn.Notifications,
                ExportModelColumn.Notifications,
                {
                    entryId: datasetId,
                    notifications,
                } satisfies WorkbookExportEntryNotifications,
            ],
        );
    }

    await WorkbookExportModel.query(WorkbookExportModel.primary).patch(update).where({
        exportId,
    });
};
