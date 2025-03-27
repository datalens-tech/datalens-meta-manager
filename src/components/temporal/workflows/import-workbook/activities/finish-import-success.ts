import {ImportStatus, WorkbookImportModel} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type FinishImportSuccessArgs = {
    importId: string;
};

export const finishImportSuccess = async (
    _: ActivitiesDeps,
    {importId}: FinishImportSuccessArgs,
): Promise<void> => {
    await WorkbookImportModel.query(WorkbookImportModel.primary)
        .patch({
            status: ImportStatus.Success,
        })
        .where({
            importId,
        });
};
