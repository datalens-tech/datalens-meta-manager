import {AppError} from '@gravity-ui/nodekit';

import {getClient} from '../../components/temporal/client';
import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {ExportModelColumn, WorkbookExportModel} from '../../db/models';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';

type CancelWorkbookExportArgs = {
    exportId: BigIntId;
};

export type CancelWorkbookExportResult = {
    exportId: BigIntId;
};

export const cancelWorkbookExport = async (
    {ctx}: ServiceArgs,
    args: CancelWorkbookExportArgs,
): Promise<CancelWorkbookExportResult> => {
    const {exportId} = args;

    ctx.log('CANCEL_WORKBOOK_EXPORT_START', {
        exportId,
    });

    const workbookExport = await WorkbookExportModel.query(WorkbookExportModel.replica)
        .select([ExportModelColumn.ExportId, ExportModelColumn.Meta])
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

    const {sourceWorkbookId} = workbookExport.meta;

    await checkWorkbookAccessById({ctx, workbookId: sourceWorkbookId});

    const client = await getClient();
    const handle = client.workflow.getHandle(exportId);

    await handle.cancel();

    ctx.log('CANCEL_WORKBOOK_EXPORT_FINISH');

    return {exportId};
};
