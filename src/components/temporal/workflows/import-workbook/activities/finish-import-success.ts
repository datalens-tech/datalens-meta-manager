import {ImportModel, ImportStatus} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type FinishImportSuccessArgs = {
    importId: string;
};

export const finishImportSuccess = async (
    _: ActivitiesDeps,
    {importId}: FinishImportSuccessArgs,
): Promise<void> => {
    await ImportModel.query(ImportModel.primary)
        .patch({
            status: ImportStatus.Success,
        })
        .where({
            importId,
        });
};
