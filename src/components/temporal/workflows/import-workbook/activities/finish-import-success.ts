import {ImportModel, ImportStatus} from '../../../../../db/models';
import {registry} from '../../../../../registry';
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

    const {db} = registry.getDbInstance();

    await ImportModel.query(db.primary)
        .patch({
            status: ImportStatus.Success,
        })
        .where({
            importId,
        });
};
