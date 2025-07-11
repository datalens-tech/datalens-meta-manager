import {PartialModelObject, raw} from 'objection';

import {META_MANAGER_NOTIFICATION_CODE} from '../../../../../constants';
import {ImportModel, ImportModelColumn, ImportStatus} from '../../../../../db/models';
import {ImportEntryNotifications} from '../../../../../db/models/import/types';
import {NotificationLevel} from '../../../../../types/models';
import type {ActivitiesDeps} from '../../../types';
import {APPLICATION_FAILURE_TYPE} from '../constants';
import {ImportWorkbookArgs} from '../types';

export type FinishImportErrorArgs = {
    workflowArgs: ImportWorkbookArgs;
    failureType?: string;
};

export const finishImportError = async (
    _: ActivitiesDeps,
    {workflowArgs, failureType}: FinishImportErrorArgs,
): Promise<void> => {
    const {importId} = workflowArgs;

    const update: PartialModelObject<ImportModel> = {
        status: ImportStatus.Error,
    };

    const isUnexpectedError = failureType !== APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION;

    if (isUnexpectedError) {
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ImportModelColumn.Notifications,
            {
                notifications: [
                    {
                        code: META_MANAGER_NOTIFICATION_CODE.UNEXPECTED_WORKFLOW_ERROR,
                        level: NotificationLevel.Critical,
                        message: 'Unexpected error while importing the workbook.',
                    },
                ],
            } satisfies ImportEntryNotifications,
        ]);
    }

    await ImportModel.query(ImportModel.primary).patch(update).where({
        importId,
    });
};
