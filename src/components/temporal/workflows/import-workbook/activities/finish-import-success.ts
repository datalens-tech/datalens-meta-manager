import {ImportModel, ImportStatus} from '../../../../../db/models';
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

    await ImportModel.query(ImportModel.primary)
        .patch({
            status: ImportStatus.Success,
        })
        .where({
            importId,
        });
};
