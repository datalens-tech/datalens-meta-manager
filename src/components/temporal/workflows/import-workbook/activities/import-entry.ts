import {ApplicationFailure} from '@temporalio/common';
import {raw} from 'objection';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import {WorkbookImportEntryNotifications} from '../../../../../db/models/workbook-import/types';
import {NotificationLevel} from '../../../../gateway/schema/ui-api/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';
import {ImportWorkbookArgs} from '../types';

export type ImportEntryArgs = {
    workflowArgs: ImportWorkbookArgs;
    scope: EntryScope;
    mockEntryId: string;
    idMapping: Record<string, string>;
};

type ImportEntryResult = {
    entryId: string;
};

export const importEntry = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workflowArgs, mockEntryId, idMapping, scope}: ImportEntryArgs,
): Promise<ImportEntryResult> => {
    const {importId, workbookId, requestId} = workflowArgs;

    const result = (await WorkbookImportModel.query(WorkbookImportModel.replica)
        .select(raw('??->?->? as data', [ImportModelColumn.Data, scope, mockEntryId]))
        .first()
        .where({
            importId,
        })) as unknown as {
        data: Record<string, unknown> | null;
    };

    if (!result.data) {
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `No data for id: ${mockEntryId}.`,
        });
    }

    const {
        responseData: {id: entryId, notifications},
    } = await gatewayApi.uiApi.importWorkbookEntry({
        ctx,
        headers: {},
        requestId,
        args: {
            idMapping,
            entryData: result.data,
            workbookId,
        },
    });

    if (notifications.length > 0) {
        await WorkbookImportModel.query(WorkbookImportModel.primary)
            .patch({
                notifications: raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
                    ImportModelColumn.Notifications,
                    {
                        entryId,
                        scope,
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
                message: `Got critical notification while importing entry: ${mockEntryId}`,
                type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
            });
        }
    }

    return {entryId};
};

// test
