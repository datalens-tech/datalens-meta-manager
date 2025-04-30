import {AppError} from '@gravity-ui/nodekit';

import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../db/models';
import {registry} from '../../registry';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';
import {WorkbookExportDataWithHash} from '../../types/workbook-export';
import {getExportDataVerificationHash} from '../../utils/export';

type GetWorkbookExportArgs = {
    exportId: BigIntId;
};

export type GetWorkbookExportResult = {
    exportId: BigIntId;
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

    const {checkExportAvailability} = registry.common.functions.get();

    await checkExportAvailability({ctx});

    const {db} = registry.getDbInstance();

    const workbookExport = await WorkbookExportModel.query(db.replica)
        .select()
        .where({
            [ExportModelColumn.ExportId]: exportId,
        })
        .first()
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookExport) {
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST, {
            code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST,
        });
    }

    if (workbookExport.status !== ExportStatus.Success) {
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED, {
            code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED,
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
