import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw} from 'objection';

import {ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import type {
    WorkbookExportEntriesData,
    WorkbookExportEntryNotifications,
} from '../../../../../db/models/workbook-export/types';
import {getCtxRequestIdWithFallback} from '../../../../../utils/ctx';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';

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
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {datasetId, idMapping},
    });

    const update: PartialModelObject<WorkbookExportModel> = {
        data: raw("jsonb_set(??, '{datasets}', (COALESCE(??->'datasets', '{}') || ?))", [
            ExportModelColumn.Data,
            ExportModelColumn.Data,
            {
                [mockDatasetId]: dataset,
            } satisfies WorkbookExportEntriesData,
        ]),
    };

    if (notifications.length > 0) {
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ExportModelColumn.Notifications,
            {
                entryId: datasetId,
                scope: EntryScope.Dataset,
                notifications,
            } satisfies WorkbookExportEntryNotifications,
        ]);
    }

    await WorkbookExportModel.query(WorkbookExportModel.primary).patch(update).where({
        exportId,
    });

    const criticalNotifications = notifications.filter(
        ({level}) => level === NotificationLevel.Critical,
    );

    if (criticalNotifications.length > 0) {
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `Got critical notification while exporting dataset: ${datasetId}`,
            type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
        });
    }
};
