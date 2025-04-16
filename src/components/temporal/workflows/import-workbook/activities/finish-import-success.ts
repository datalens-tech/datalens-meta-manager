import {ImportStatus, WorkbookImportModel} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';
import {ImportWorkbookArgs} from '../types';

export type FinishImportSuccessArgs = {
    workflowArgs: ImportWorkbookArgs;
};

export const finishImportSuccess = async (
    _: ActivitiesDeps,
    {workflowArgs}: FinishImportSuccessArgs,
): Promise<void> => {
    const {importId} = workflowArgs;

    await WorkbookImportModel.query(WorkbookImportModel.primary)
        .patch({
            status: ImportStatus.Success,
        })
        .where({
            importId,
        });
};
