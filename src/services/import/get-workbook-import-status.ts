import {AppError} from '@gravity-ui/nodekit';
import {raw} from 'objection';

import {getClient} from '../../components/temporal/client';
import {getWorkbookImportProgress} from '../../components/temporal/workflows';
import {checkWorkbookUpdateAccessBindingsPermission} from '../../components/us/utils';
import {TRANSFER_ERROR} from '../../constants';
import {ImportModelColumn, ImportStatus, WorkbookImportModel} from '../../db/models';
import {
    WorkbookImportErrors,
    WorkbookImportNotifications,
} from '../../db/models/workbook-import/types';
import {ServiceArgs} from '../../types/service';

type GetWorkbookImportStatusArgs = {
    importId: string;
};

export type GetWorkbookImportStatusResult = {
    status: ImportStatus;
    importId: string;
    progress: number;
    errors: WorkbookImportErrors | null;
    notifications: WorkbookImportNotifications | null;
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
        .select([
            ImportModelColumn.ImportId,
            ImportModelColumn.Status,
            ImportModelColumn.Meta,
            // select errors column only if status is error
            raw(`CASE WHEN ?? = ? THEN ?? ELSE NULL END AS ??`, [
                ImportModelColumn.Status,
                ImportStatus.Error,
                ImportModelColumn.Errors,
                ImportModelColumn.Errors,
            ]),
            // select notifications column only if status is success
            raw(`CASE WHEN ?? = ? THEN ?? ELSE NULL END AS ??`, [
                ImportModelColumn.Status,
                ImportStatus.Success,
                ImportModelColumn.Notifications,
                ImportModelColumn.Notifications,
            ]),
        ])
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

    const {workbookId} = workbookImport.meta;

    await checkWorkbookUpdateAccessBindingsPermission({ctx, workbookId});

    ctx.log('GET_WORKBOOK_IMPORT_STATUS_FINISH');

    return {
        importId: workbookImport.importId,
        status: workbookImport.status,
        errors: workbookImport.errors,
        notifications: workbookImport.notifications,
        progress,
    };
};
