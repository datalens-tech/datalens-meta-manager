import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ExportModel, ExportModelColumn} from '../../../../../db/models';
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
        await ExportModel.query(ExportModel.primary)
            .patch({
                error: raw(
                    "jsonb_set(COALESCE(??, '{}'), '{criticalNotifications}', (COALESCE(??->'criticalNotifications', '[]') || ?))",
                    [
                        ExportModelColumn.Error,
                        ExportModelColumn.Error,
                        {
                            entryId: connectionId,
                            notifications,
                        },
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

    const update: PartialModelObject<ExportModel> = {
        data: raw("jsonb_set(??, '{connections}', (COALESCE(??->'connections', '{}') || ?))", [
            ExportModelColumn.Data,
            ExportModelColumn.Data,
            {
                [mockConnectionId]: {
                    data: connection,
                },
            },
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
                },
            ],
        );
    }

    await ExportModel.query(ExportModel.primary).patch(update).where({
        exportId,
    });
};
