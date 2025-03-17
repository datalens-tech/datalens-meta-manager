import {AppError} from '@gravity-ui/nodekit';

import {getClient} from '../../components/temporal/client';
import {getWorkbookImportProgress} from '../../components/temporal/workflows';
import {TRANSFER_ERROR} from '../../constants';
import {ImportModelColumn, ImportStatus, WorkbookImportModel} from '../../db/models';
import {ServiceArgs} from '../../types/service';

type GetWorkbookImportStatusArgs = {
    importId: string;
};

export type GetWorkbookImportStatusResult = {
    status: ImportStatus;
    importId: string;
    progress: number;
    errors: Record<string, unknown> | null;
};

export const getWorkbookImportStatus = async (
    {ctx}: ServiceArgs,
    args: GetWorkbookImportStatusArgs,
): Promise<GetWorkbookImportStatusResult> => {
    const {importId} = args;

    ctx.log('GET_WORKBOOK_IMPORT_STATUS_START', {
        importId,
    });

    const client = await getClient();
    const handle = client.workflow.getHandle(importId);
    const progress = await handle.query(getWorkbookImportProgress);

    const workbookImport = await WorkbookImportModel.query(WorkbookImportModel.replica)
        .select([ImportModelColumn.ImportId, ImportModelColumn.Status, ImportModelColumn.Errors])
        .where({
            [ImportModelColumn.ImportId]: importId,
        })
        .first()
        .timeout(WorkbookImportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookImport) {
        throw new AppError(TRANSFER_ERROR.IMPORT_NOT_EXIST, {
            code: TRANSFER_ERROR.IMPORT_NOT_EXIST,
        });
    }

    ctx.log('GET_WORKBOOK_IMPORT_STATUS_FINISH');

    return {
        importId: workbookImport.importId,
        status: workbookImport.status,
        progress,
        errors: workbookImport.errors,
    };
};
