import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw} from 'objection';

import {ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import {
    WorkbookExportEntriesData,
    WorkbookExportEntryNotifications,
} from '../../../../../db/models/workbook-export/types';
import {getCtxRequestIdWithFallback} from '../../../../../utils/ctx';
import {NotificationLevel} from '../../../../gateway/schema/bi/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';

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
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {connectionId},
    });

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
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ExportModelColumn.Notifications,
            {
                entryId: connectionId,
                scope: EntryScope.Connection,
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
            message: `Got critical notification while exporting connection: ${connectionId}`,
            type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
        });
    }
};
