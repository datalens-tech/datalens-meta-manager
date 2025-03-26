import {ApplicationFailure} from '@temporalio/common';
import {raw} from 'objection';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import {WorkbookImportEntryNotifications} from '../../../../../db/models/workbook-import/types';
import {getCtxRequestIdWithFallback} from '../../../../../utils/ctx';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';

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
    const result = (await WorkbookImportModel.query(WorkbookImportModel.replica)
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
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {
            idMapping,
            data: {
                workbookId,
                dataset: result.dataset,
            },
        },
    });

    if (notifications.length > 0) {
        await WorkbookImportModel.query(WorkbookImportModel.primary)
            .patch({
                notifications: raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
                    ImportModelColumn.Notifications,
                    {
                        entryId: datasetId,
                        scope: EntryScope.Dataset,
                        notifications,
                    } satisfies WorkbookImportEntryNotifications,
                ]),
            })
            .where({
                importId,
            });

        const criticalNotifications = notifications.filter(
            ({level}) => level === NotificationLevel.Critical,
        );

        if (criticalNotifications.length > 0) {
            throw ApplicationFailure.create({
                nonRetryable: true,
                message: `Got critical notification while importing dataset: ${mockDatasetId}`,
                type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
            });
        }
    }

    return {datasetId};
};
