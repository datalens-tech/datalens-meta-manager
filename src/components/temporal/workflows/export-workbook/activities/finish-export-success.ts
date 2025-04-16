import {ExportStatus, WorkbookExportModel} from '../../../../../db/models';
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

    await WorkbookExportModel.query(WorkbookExportModel.primary)
        .patch({
            status: ExportStatus.Success,
        })
        .where({
            exportId,
        });
};
