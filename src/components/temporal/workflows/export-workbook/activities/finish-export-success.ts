import {ExportModel, ExportStatus} from '../../../../../db/models';
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

    await ExportModel.query(ExportModel.primary)
        .patch({
            status: ExportStatus.Success,
        })
        .where({
            exportId,
        });
};
