import {ExportStatus, WorkbookExportModel} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type FinishExportErrorArgs = {
    exportId: string;
    error: unknown;
};

export const finishExportError = async (
    _: ActivitiesDeps,
    {exportId}: FinishExportErrorArgs,
): Promise<void> => {
    await WorkbookExportModel.query(WorkbookExportModel.primary)
        .patch({
            status: ExportStatus.Error,
        })
        .where({
            exportId,
        });
};
