import {ExportStatus, WorkbookExportModel} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type FinishExportSuccessArgs = {
    exportId: string;
};

export const finishExportSuccess = async (
    _: ActivitiesDeps,
    {exportId}: FinishExportSuccessArgs,
): Promise<void> => {
    await WorkbookExportModel.query(WorkbookExportModel.primary)
        .patch({
            status: ExportStatus.Success,
        })
        .where({
            exportId,
        });
};
