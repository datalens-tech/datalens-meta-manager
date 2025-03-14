import {ImportModel, ImportStatus} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type FinishImportErrorArgs = {
    importId: string;
    error: unknown;
};

export const finishImportError = async (
    _: ActivitiesDeps,
    {importId}: FinishImportErrorArgs,
): Promise<void> => {
    await ImportModel.query(ImportModel.primary)
        .patch({
            status: ImportStatus.Success,
        })
        .where({
            importId,
        });
};
