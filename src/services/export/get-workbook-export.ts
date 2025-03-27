import {AppError} from '@gravity-ui/nodekit';

import {checkWorkbookAccessById} from '../../components/us/utils';
import {TRANSFER_ERROR} from '../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../db/models';
import {ServiceArgs} from '../../types/service';
import {WorkbookExportDataWithHash} from '../../types/workbook-export';
import {getExportDataVerificationHash} from '../../utils/get-export-data-verification-hash';

type GetWorkbookExportArgs = {
    exportId: string;
};

export type GetWorkbookExportResult = {
    exportId: string;
    status: ExportStatus;
    data: WorkbookExportDataWithHash;
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
        throw new AppError(TRANSFER_ERROR.WORKBOOK_EXPORT_NOT_EXIST, {
            code: TRANSFER_ERROR.WORKBOOK_EXPORT_NOT_EXIST,
        });
    }

    if (workbookExport.status !== ExportStatus.Success) {
        throw new AppError(TRANSFER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED, {
            code: TRANSFER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED,
        });
    }

    const {sourceWorkbookId} = workbookExport.meta;

    await checkWorkbookAccessById({ctx, workbookId: sourceWorkbookId});

    const hash = getExportDataVerificationHash({
        data: workbookExport.data,
        secret: ctx.config.exportDataVerificationKey,
    });

    ctx.log('GET_WORKBOOK_EXPORT_FINISH');

    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        data: {
            export: workbookExport.data,
            hash,
        },
    };
};
