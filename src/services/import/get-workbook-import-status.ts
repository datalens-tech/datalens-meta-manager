import {AppError} from '@gravity-ui/nodekit';
import {raw} from 'objection';

import {getClient} from '../../components/temporal/client';
import {getWorkbookImportProgress} from '../../components/temporal/workflows';
import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {ImportModel, ImportModelColumn, ImportStatus} from '../../db/models';
import {ImportNotifications} from '../../db/models/import/types';
import {getReplica} from '../../db/utils';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';
import {encodeId} from '../../utils';

type GetWorkbookImportStatusArgs = {
    importId: BigIntId;
};

export type GetWorkbookImportStatusResult = {
    status: ImportStatus;
    importId: BigIntId;
    progress: number;
    notifications: ImportNotifications | null;
    workbookId: string;
};

export const getWorkbookImportStatus = async (
    {ctx, trx}: ServiceArgs,
    args: GetWorkbookImportStatusArgs,
): Promise<GetWorkbookImportStatusResult> => {
    const {importId} = args;

    const encodedImportId = encodeId(importId);

    ctx.log('GET_WORKBOOK_IMPORT_STATUS_START', {
        importId: encodedImportId,
    });

    const client = await getClient();
    const handle = client.workflow.getHandle(encodedImportId);
    const progress = await handle.query(getWorkbookImportProgress);

    const workbookImport = await ImportModel.query(getReplica(trx))
        .select([
            ImportModelColumn.ImportId,
            ImportModelColumn.Status,
            ImportModelColumn.Meta,
            // select notifications column only if status is success
            raw(`CASE WHEN ?? = ? OR ?? = ? THEN ?? ELSE NULL END AS ??`, [
                ImportModelColumn.Status,
                ImportStatus.Success,
                ImportModelColumn.Status,
                ImportStatus.Error,
                ImportModelColumn.Notifications,
                ImportModelColumn.Notifications,
            ]),
        ])
        .where({
            [ImportModelColumn.ImportId]: importId,
        })
        .first()
        .timeout(ImportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookImport) {
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_IMPORT_NOT_EXIST, {
            code: META_MANAGER_ERROR.WORKBOOK_IMPORT_NOT_EXIST,
        });
    }

    const {workbookId} = workbookImport.meta;

    await checkWorkbookAccessById({ctx, workbookId});

    ctx.log('GET_WORKBOOK_IMPORT_STATUS_FINISH');

    return {
        importId: workbookImport.importId,
        status: workbookImport.status,
        notifications: workbookImport.notifications,
        progress,
        workbookId,
    };
};
