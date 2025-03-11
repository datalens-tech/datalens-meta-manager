import {AppError} from '@gravity-ui/nodekit';

import {getClient} from '../../components/temporal/client';
import {getProgress} from '../../components/temporal/workflows';
import {TRANSFER_ERROR} from '../../constants';
import {ExportModel, ExportModelColumn} from '../../db/models';
import {ServiceArgs} from '../../types/service';

type GetWorkbookExportStatusArgs = {
    exportId: string;
};

export type GetWorkbookExportStatusResult = {
    workbookExport: ExportModel;
    progress: number;
};

export const getWorkbookExportStatus = async (
    {ctx}: ServiceArgs,
    args: GetWorkbookExportStatusArgs,
): Promise<GetWorkbookExportStatusResult> => {
    const {exportId} = args;

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_START', {
        exportId,
    });

    const client = await getClient();
    const handle = client.workflow.getHandle(exportId);
    const progress = await handle.query(getProgress);

    const workbookExport = await ExportModel.query(ExportModel.replica)
        .select([ExportModelColumn.ExportId, ExportModelColumn.Status])
        .where({
            [ExportModelColumn.ExportId]: exportId,
        })
        .first()
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookExport) {
        throw new AppError(TRANSFER_ERROR.EXPORT_NOT_EXIST, {
            code: TRANSFER_ERROR.EXPORT_NOT_EXIST,
        });
    }

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_FINISH', {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        progress,
    });

    return {workbookExport, progress};
};
