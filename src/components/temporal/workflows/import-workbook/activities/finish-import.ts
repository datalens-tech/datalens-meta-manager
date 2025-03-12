import {ImportStatus} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type FinishImportArgs = {
    importId: string;
};

export const finishImport = async (
    {models: {ImportModel}}: ActivitiesDeps,
    {importId}: FinishImportArgs,
): Promise<void> => {
    await ImportModel.query(ImportModel.primary)
        .patch({
            status: ImportStatus.Success,
        })
        .where({
            importId,
        });
};
