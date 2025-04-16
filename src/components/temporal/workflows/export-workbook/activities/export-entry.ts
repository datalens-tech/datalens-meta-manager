import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw} from 'objection';

import {ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import {
    WorkbookExportEntriesData,
    WorkbookExportEntryNotifications,
} from '../../../../../db/models/workbook-export/types';
import {NotificationLevel} from '../../../../gateway/schema/ui-api/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';
import {ExportWorkbookArgs} from '../types';

export type ExportEntryArgs = {
    workflowArgs: ExportWorkbookArgs;
    entryId: string;
    mockEntryId: string;
    scope: EntryScope;
    idMapping: Record<string, string>;
};

export const exportEntry = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workflowArgs, entryId, mockEntryId, scope, idMapping}: ExportEntryArgs,
): Promise<void> => {
    const {workbookId, exportId, requestId} = workflowArgs;

    const {
        responseData: {entryData, notifications},
    } = await gatewayApi.uiApi.exportWorkbookEntry({
        ctx,
        headers: {},
        requestId,
        args: {exportId: entryId, scope, idMapping, workbookId},
    });

    const update: PartialModelObject<WorkbookExportModel> = {
        data: raw("jsonb_set(??, '{??}', (COALESCE(??->?, '{}') || ?))", [
            ExportModelColumn.Data,
            scope,
            ExportModelColumn.Data,
            scope,
            {
                [mockEntryId]: entryData,
            } satisfies WorkbookExportEntriesData,
        ]),
    };

    if (notifications.length > 0) {
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ExportModelColumn.Notifications,
            {
                entryId,
                scope,
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
            message: `Got critical notification while exporting entry: ${entryId}`,
            type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
        });
    }
};
