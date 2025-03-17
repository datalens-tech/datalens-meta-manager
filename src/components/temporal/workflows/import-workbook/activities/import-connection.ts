import {ApplicationFailure} from '@temporalio/common';
import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {
    ExportModelColumn,
    WorkbookExportModel,
    WorkbookImportModel,
} from '../../../../../db/models';
import {WorkbookImportEntryNotifications} from '../../../../../db/models/workbook-import/types';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import type {ActivitiesDeps} from '../../../types';

export type ImportConnectionArgs = {
    importId: string;
    workbookId: string;
    mockConnectionId: string;
};

export type ImportConnectionResult = {
    connectionId: string;
};

export const importConnection = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {importId, workbookId, mockConnectionId}: ImportConnectionArgs,
): Promise<ImportConnectionResult> => {
    const result = (await WorkbookExportModel.query(WorkbookExportModel.primary)
        .select(raw('??->connections->? as connection', [ExportModelColumn.Data, mockConnectionId]))
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
        authArgs: {},
        requestId: uuidv4(),
        args: {
            data: {
                workbookId,
                connection: result.connection,
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
                    [ExportModelColumn.Errors, ExportModelColumn.Errors, criticalNotifications],
                ),
            })
            .where({
                importId,
            });

        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `Got critical notification while importing connection: ${mockConnectionId}`,
        });
    }

    if (notifications.length > 0) {
        await WorkbookImportModel.query(WorkbookImportModel.primary)
            .patch({
                notifications: raw(
                    "jsonb_set(COALESCE(??, '{}'), '{connections}', (COALESCE(??->'connections', '[]') || ?))",
                    [
                        ExportModelColumn.Notifications,
                        ExportModelColumn.Notifications,
                        {
                            entryId: connectionId,
                            notifications,
                        } satisfies WorkbookImportEntryNotifications,
                    ],
                ),
            })
            .where({
                importId,
            });
    }

    return {connectionId};
};
