import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import {
    WorkbookExportEntriesData,
    WorkbookExportEntryNotifications,
} from '../../../../../db/models/workbook-export/types';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import type {ActivitiesDeps} from '../../../types';

export type ExportConnectionArgs = {
    exportId: string;
    connectionId: string;
    mockConnectionId: string;
};

export const exportConnection = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {exportId, connectionId, mockConnectionId}: ExportConnectionArgs,
): Promise<void> => {
    const {
        responseData: {connection, notifications},
    } = await gatewayApi.bi.exportConnection({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {connectionId},
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
                            entryId: connectionId,
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
            message: `Got critical notification while exporting connection: ${connectionId}`,
        });
    }

    const update: PartialModelObject<WorkbookExportModel> = {
        data: raw("jsonb_set(??, '{connections}', (COALESCE(??->'connections', '{}') || ?))", [
            ExportModelColumn.Data,
            ExportModelColumn.Data,
            {
                [mockConnectionId]: connection,
            } satisfies WorkbookExportEntriesData,
        ]),
    };

    if (notifications.length > 0) {
        update.notifications = raw(
            "jsonb_set(COALESCE(??, '{}'), '{connections}', (COALESCE(??->'connections', '[]') || ?))",
            [
                ExportModelColumn.Notifications,
                ExportModelColumn.Notifications,
                {
                    entryId: connectionId,
                    notifications,
                } satisfies WorkbookExportEntryNotifications,
            ],
        );
    }

    await WorkbookExportModel.query(WorkbookExportModel.primary).patch(update).where({
        exportId,
    });
};
