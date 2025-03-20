import {AppError} from '@gravity-ui/nodekit';

import {checkWorkbookAccessById} from '../../components/us/utils';
import {TRANSFER_ERROR} from '../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../db/models';
import {ServiceArgs} from '../../types/service';

type GetWorkbookExportArgs = {
    exportId: string;
};

export type GetWorkbookExportResult = {
    exportId: string;
    status: ExportStatus;
    data: Record<string, unknown>;
};

export const getWorkbookExport = async (
    {ctx}: ServiceArgs,
    args: GetWorkbookExportArgs,
): Promise<GetWorkbookExportResult> => {
    const {exportId} = args;

    ctx.log('GET_WORKBOOK_EXPORT_START', {
        exportId,
    });

    const workbookExport = await WorkbookExportModel.query(WorkbookExportModel.replica)
        .select()
        .where({
            [ExportModelColumn.ExportId]: exportId,
        })
        .first()
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookExport) {
        throw new AppError(TRANSFER_ERROR.EXPORT_NOT_EXIST, {
            code: TRANSFER_ERROR.EXPORT_NOT_EXIST,
        });
    }

    const {sourceWorkbookId} = workbookExport.meta;

    await checkWorkbookAccessById({ctx, workbookId: sourceWorkbookId});

    ctx.log('GET_WORKBOOK_EXPORT_FINISH');

    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        data: workbookExport.data,
    };
};
