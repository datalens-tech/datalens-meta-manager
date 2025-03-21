import {PartialModelObject, raw} from 'objection';

import {TRANSFER_NOTIFICATION_CODE} from '../../../../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../../../../db/models';
import {WorkbookExportEntryNotifications} from '../../../../../db/models/workbook-export/types';
import {NotificationLevel} from '../../../../../types/models';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';

export type FinishExportErrorArgs = {
    exportId: string;
    failureType?: string;
};

export const finishExportError = async (
    _: ActivitiesDeps,
    {exportId, failureType}: FinishExportErrorArgs,
): Promise<void> => {
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
                        code: TRANSFER_NOTIFICATION_CODE.UNEXPECTED_WORKFLOW_ERROR,
                        level: NotificationLevel.Critical,
                        message: 'Unexpected error while exporting the workbook.',
                    },
                ],
            } satisfies WorkbookExportEntryNotifications,
        ]);
    }

    await WorkbookExportModel.query(WorkbookExportModel.primary).patch(update).where({
        exportId,
    });
};
