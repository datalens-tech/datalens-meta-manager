import {PartialModelObject, raw} from 'objection';

import {META_MANAGER_NOTIFICATION_CODE} from '../../../../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../../../../db/models';
import {
    WorkbookExportEntryNotifications,
    WorkbookExportNotification,
} from '../../../../../db/models/workbook-export/types';
import {registry} from '../../../../../registry';
import {NotificationLevel} from '../../../../../types/models';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';
import {ExportWorkbookArgs} from '../types';

export type FinishExportErrorArgs = {
    workflowArgs: ExportWorkbookArgs;
    failureType?: string;
};

export const finishExportError = async (
    _: ActivitiesDeps,
    {workflowArgs, failureType}: FinishExportErrorArgs,
): Promise<void> => {
    const {exportId} = workflowArgs;

    const update: PartialModelObject<WorkbookExportModel> = {
        status: ExportStatus.Error,
    };

    const isCriticalNotificationError =
        failureType === APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION;
    const isCancelledError = failureType === APPLICATION_FAILURE_TYPE.CANCELLED;

    const isUnexpectedError = !isCriticalNotificationError && !isCancelledError;

    const notifications: WorkbookExportNotification[] = [];

    if (isCancelledError) {
        notifications.push({
            code: META_MANAGER_NOTIFICATION_CODE.WORKBOOK_EXPORT_CANCELLED,
            level: NotificationLevel.Critical,
            message: 'Workbook export was cancelled.',
        });
    }

    if (isUnexpectedError) {
        notifications.push({
            code: META_MANAGER_NOTIFICATION_CODE.UNEXPECTED_WORKFLOW_ERROR,
            level: NotificationLevel.Critical,
            message: 'Unexpected error while exporting the workbook.',
        });
    }

    if (notifications.length > 0) {
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ExportModelColumn.Notifications,
            {
                notifications,
            } satisfies WorkbookExportEntryNotifications,
        ]);
    }

    const {db} = registry.getDbInstance();

    await WorkbookExportModel.query(db.primary).patch(update).where({
        exportId,
    });
};
