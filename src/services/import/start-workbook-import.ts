import {AppError} from '@gravity-ui/nodekit';
import {raw} from 'objection';

import {WorkbookStatus} from '../../components/gateway/schema/us/types/workbook';
import {startImportWorkbookWorkflow} from '../../components/temporal/client';
import {
    TRANSFER_ERROR,
    WORKBOOK_EXPORT_DATA_VERSION,
    WORKBOOK_IMPORT_EXPIRATION_DAYS,
} from '../../constants';
import {WorkbookImportModel} from '../../db/models';
import {WorkbookExportData} from '../../db/models/workbook-export/types';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';
import {getCtxRequestIdWithFallback} from '../../utils/ctx';

type StartWorkbookImportArgs = {
    data: WorkbookExportData;
    title: string;
    description?: string;
    collectionId?: string;
};

export type StartWorkbookImportResult = {
    importId: string;
    workbookId: string;
};

export const startWorkbookImport = async (
    {ctx}: ServiceArgs,
    args: StartWorkbookImportArgs,
): Promise<StartWorkbookImportResult> => {
    const {data, title, description, collectionId} = args;

    ctx.log('START_WORKBOOK_IMPORT_START', {
        title,
        description,
        collectionId,
    });

    if (data.version !== WORKBOOK_EXPORT_DATA_VERSION) {
        throw new AppError(TRANSFER_ERROR.WORKBOOK_EXPORT_DATA_OUTDATED, {
            code: TRANSFER_ERROR.WORKBOOK_EXPORT_DATA_OUTDATED,
        });
    }

    const {gatewayApi} = registry.getGatewayApi();

    const {responseData: workbook} = await gatewayApi.us.createWorkbook({
        ctx,
        headers: {},
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {title, description, collectionId},
    });

    const user = ctx.get('user');

    const workbookImport = await WorkbookImportModel.query(WorkbookImportModel.primary)
        .insert({
            createdBy: user?.userId ?? '',
            expiredAt: raw(`NOW() + INTERVAL '?? DAY'`, [WORKBOOK_IMPORT_EXPIRATION_DAYS]),
            meta: {workbookId: workbook.workbookId},
            data,
        })
        .timeout(WorkbookImportModel.DEFAULT_QUERY_TIMEOUT);

    await gatewayApi.us.updateWorkbook({
        ctx,
        headers: {},
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {
            workbookId: workbook.workbookId,
            status: WorkbookStatus.Importing,
            meta: {...workbook.meta, importId: workbookImport.importId},
        },
    });

    await startImportWorkbookWorkflow({
        importId: workbookImport.importId,
        workbookId: workbook.workbookId,
    });

    ctx.log('START_WORKBOOK_IMPORT_FINISH', {
        importId: workbookImport.importId,
        workbookId: workbook.workbookId,
    });

    return {importId: workbookImport.importId, workbookId: workbook.workbookId};
};
