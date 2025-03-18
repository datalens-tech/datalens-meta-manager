import {ApplicationFailure} from '@temporalio/common';
import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import {WorkbookImportEntryNotifications} from '../../../../../db/models/workbook-import/types';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import type {ActivitiesDeps} from '../../../types';

export type ImportDatasetArgs = {
    importId: string;
    workbookId: string;
    mockDatasetId: string;
    idMapping: Record<string, string>;
};

type ImportDatasetResult = {
    datasetId: string;
};

export const importDataset = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {importId, workbookId, mockDatasetId, idMapping}: ImportDatasetArgs,
): Promise<ImportDatasetResult> => {
    const result = (await WorkbookImportModel.query(WorkbookImportModel.primary)
        .select(raw('??->?->? as dataset', [ImportModelColumn.Data, 'datasets', mockDatasetId]))
        .first()
        .where({
            importId,
        })) as unknown as {
        dataset: unknown | null;
    };

    if (!result.dataset) {
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `No Dataset data for id: ${mockDatasetId}.`,
        });
    }

    const {
        responseData: {id: datasetId, notifications},
    } = await gatewayApi.bi.importDataset({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {
            idMapping,
            data: {
                workbookId,
                dataset: result.dataset,
            },
        },
    });

    const criticalNotifications = notifications.filter(
        ({level}) => level === NotificationLevel.Critical,
    );

    if (criticalNotifications.length > 0) {
        await WorkbookImportModel.query(WorkbookImportModel.primary)
            .patch({
                errors: raw(
                    "jsonb_set(COALESCE(??, '{}'), '{criticalNotifications}', (COALESCE(??->'criticalNotifications', '[]') || ?))",
                    [ImportModelColumn.Errors, ImportModelColumn.Errors, criticalNotifications],
                ),
            })
            .where({
                importId,
            });

        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `Got critical notification while importing dataset: ${mockDatasetId}`,
        });
    }

    if (notifications.length > 0) {
        await WorkbookImportModel.query(WorkbookImportModel.primary)
            .patch({
                notifications: raw(
                    "jsonb_set(COALESCE(??, '{}'), '{datasets}', (COALESCE(??->'datasets', '[]') || ?))",
                    [
                        ImportModelColumn.Notifications,
                        ImportModelColumn.Notifications,
                        {
                            entryId: datasetId,
                            notifications,
                        } satisfies WorkbookImportEntryNotifications,
                    ],
                ),
            })
            .where({
                importId,
            });
    }

    return {datasetId};
};
