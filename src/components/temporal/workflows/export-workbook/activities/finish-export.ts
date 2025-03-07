import {ExportStatus} from '../../../../../db/models/export';
import type {ActivitiesDeps} from '../../../types';

export type FinishExportArgs = {
    exportId: string;
};

export async function finishExport(
    {models: {ExportModel}}: ActivitiesDeps,
    {exportId}: FinishExportArgs,
): Promise<void> {
    await ExportModel.query(ExportModel.primary)
        .patch({
            status: ExportStatus.Success,
        })
        .where({
            exportId,
        });
}
