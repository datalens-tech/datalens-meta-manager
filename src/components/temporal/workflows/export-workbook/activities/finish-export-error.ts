import {PartialModelObject, raw} from 'objection';

import {META_MANAGER_NOTIFICATION_CODE} from '../../../../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../../../../db/models';
import {WorkbookExportEntryNotifications} from '../../../../../db/models/workbook-export/types';
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

    const isUnexpectedError = failureType !== APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION;

    if (isUnexpectedError) {
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ExportModelColumn.Notifications,
            {
                notifications: [
                    {
                        code: META_MANAGER_NOTIFICATION_CODE.UNEXPECTED_WORKFLOW_ERROR,
                        level: NotificationLevel.Critical,
                        message: 'Unexpected error while exporting the workbook.',
                    },
                ],
            } satisfies WorkbookExportEntryNotifications,
        ]);
    }

    const {db} = registry.getDbInstance();

    await WorkbookExportModel.query(db.primary).patch(update).where({
        exportId,
    });
};
