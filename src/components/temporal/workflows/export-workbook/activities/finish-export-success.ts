import {ExportModel, ExportStatus} from '../../../../../db/models/export';
import type {ActivitiesDeps} from '../../../types';

export type FinishExportSuccessArgs = {
    exportId: string;
};

export const finishExportSuccess = async (
    _: ActivitiesDeps,
    {exportId}: FinishExportSuccessArgs,
): Promise<void> => {
    await ExportModel.query(ExportModel.primary)
        .patch({
            status: ExportStatus.Success,
        })
        .where({
            exportId,
        });
};
