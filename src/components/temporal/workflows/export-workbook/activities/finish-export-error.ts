import {ExportModel, ExportStatus} from '../../../../../db/models/export';
import type {ActivitiesDeps} from '../../../types';

export type FinishExportErrorArgs = {
    exportId: string;
    error: unknown;
};

export const finishExportError = async (
    _: ActivitiesDeps,
    {exportId}: FinishExportErrorArgs,
): Promise<void> => {
    await ExportModel.query(ExportModel.primary)
        .patch({
            status: ExportStatus.Error,
        })
        .where({
            exportId,
        });
};
