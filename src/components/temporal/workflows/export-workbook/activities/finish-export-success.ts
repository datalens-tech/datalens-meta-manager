import {ExportModel, ExportStatus} from '../../../../../db/models';
import {registry} from '../../../../../registry';
import type {ActivitiesDeps} from '../../../types';
import {ExportWorkbookArgs} from '../types';

export type FinishExportSuccessArgs = {
    workflowArgs: ExportWorkbookArgs;
};

export const finishExportSuccess = async (
    _: ActivitiesDeps,
    {workflowArgs}: FinishExportSuccessArgs,
): Promise<void> => {
    const {exportId} = workflowArgs;

    const {db} = registry.getDbInstance();

    await ExportModel.query(db.primary)
        .patch({
            status: ExportStatus.Success,
        })
        .where({
            exportId,
        });
};
