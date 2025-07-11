import {AppError} from '@gravity-ui/nodekit';

import {getClient} from '../../components/temporal/client';
import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {ImportModel, ImportModelColumn} from '../../db/models';
import {getReplica} from '../../db/utils';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';
import {encodeId} from '../../utils';

type CancelWorkbookImportArgs = {
    importId: BigIntId;
};

export type CancelWorkbookImportResult = {
    importId: BigIntId;
};

export const cancelWorkbookImport = async (
    {ctx, trx}: ServiceArgs,
    args: CancelWorkbookImportArgs,
): Promise<CancelWorkbookImportResult> => {
    const {importId} = args;

    const encodedImportId = encodeId(importId);

    ctx.log('CANCEL_WORKBOOK_IMPORT_START', {
        importId: encodedImportId,
    });

    const workbookImport = await ImportModel.query(getReplica(trx))
        .select([ImportModelColumn.ImportId, ImportModelColumn.Meta])
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

    await checkWorkbookAccessById({ctx, workbookId: workbookId});

    const client = await getClient();
    const handle = client.workflow.getHandle(encodedImportId);

    await handle.cancel();

    ctx.log('CANCEL_WORKBOOK_IMPORT_FINISH');

    return {importId};
};
