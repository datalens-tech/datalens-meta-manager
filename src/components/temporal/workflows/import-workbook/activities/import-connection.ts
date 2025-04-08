import {ApplicationFailure} from '@temporalio/common';
import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import {WorkbookImportEntryNotifications} from '../../../../../db/models/workbook-import/types';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';

export type ImportConnectionArgs = {
    importId: string;
    workbookId: string;
    mockConnectionId: string;
};

type ImportConnectionResult = {
    connectionId: string;
};

export const importConnection = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {importId, workbookId, mockConnectionId}: ImportConnectionArgs,
): Promise<ImportConnectionResult> => {
    const result = (await WorkbookImportModel.query(WorkbookImportModel.replica)
        .select(
            raw('??->?->? as connection', [
                ImportModelColumn.Data,
                'connections',
                mockConnectionId,
            ]),
        )
        .first()
        .where({
            importId,
        })) as unknown as {
        connection: unknown | null;
    };

    if (!result.connection) {
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `No connection data for id: ${mockConnectionId}.`,
        });
    }

    const {
        responseData: {id: connectionId, notifications},
    } = await gatewayApi.bi.importConnection({
        ctx,
        headers: {},
        requestId: uuidv4(),
        args: {
            data: {
                workbookId,
                connection: result.connection,
            },
        },
    });

    if (notifications.length > 0) {
        await WorkbookImportModel.query(WorkbookImportModel.primary)
            .patch({
                notifications: raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
                    ImportModelColumn.Notifications,
                    {
                        entryId: connectionId,
                        scope: EntryScope.Connection,
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
                message: `Got critical notification while importing connection: ${mockConnectionId}`,
                type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
            });
        }
    }

    return {connectionId};
};
