import {AppError} from '@gravity-ui/nodekit';

import {TRANSFER_ERROR} from '../../constants';
import {ExportModel, ExportModelColumn} from '../../db/models';
import {ServiceArgs} from '../../types/service';

type GetWorkbookExportArgs = {
    exportId: string;
};

export type GetWorkbookExportResult = ExportModel;

export const getWorkbookExport = async (
    {ctx}: ServiceArgs,
    args: GetWorkbookExportArgs,
): Promise<GetWorkbookExportResult> => {
    const {exportId} = args;

    ctx.log('GET_WORKBOOK_EXPORT_START', {
        exportId,
    });

    const workbookExport = await ExportModel.query(ExportModel.replica)
        .select()
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

    ctx.log('GET_WORKBOOK_EXPORT_FINISH');

    return workbookExport;
};
