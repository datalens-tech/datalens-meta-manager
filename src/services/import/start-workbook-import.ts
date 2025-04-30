import {AppError} from '@gravity-ui/nodekit';
import {HttpStatusCode} from 'axios';
import {raw} from 'objection';

import {isGatewayError} from '../../components/gateway';
import {Workbook, WorkbookStatus} from '../../components/gateway/schema/us/types/workbook';
import {startImportWorkbookWorkflow} from '../../components/temporal/client';
import {getDefaultUsHeaders} from '../../components/us/utils';
import {
    META_MANAGER_ERROR,
    SYSTEM_USER,
    WORKBOOK_EXPORT_DATA_VERSION,
    WORKBOOK_IMPORT_EXPIRATION_DAYS,
} from '../../constants';
import {WorkbookImportModel} from '../../db/models';
import {registry} from '../../registry';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';
import {WorkbookExportDataWithHash} from '../../types/workbook-export';
import {getCtxInfo, getCtxRequestIdWithFallback} from '../../utils/ctx';
import {getExportDataVerificationHash} from '../../utils/export';

type StartWorkbookImportArgs = {
    data: WorkbookExportDataWithHash;
    title: string;
    description?: string;
    collectionId?: string | null;
};

export type StartWorkbookImportResult = {
    importId: BigIntId;
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

    if (data.export.version !== WORKBOOK_EXPORT_DATA_VERSION) {
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_EXPORT_DATA_OUTDATED, {
            code: META_MANAGER_ERROR.WORKBOOK_EXPORT_DATA_OUTDATED,
        });
    }

    const {gatewayApi} = registry.getGatewayApi();
    const {db} = registry.getDbInstance();
    const {tenantId, user} = getCtxInfo(ctx);

    const requestId = getCtxRequestIdWithFallback(ctx);

    let workbook: Workbook;

    try {
        const {responseData} = await gatewayApi.us.createWorkbook({
            ctx,
            headers: getDefaultUsHeaders(ctx),
            requestId,
            args: {
                title,
                description,
                collectionId,
                status: WorkbookStatus.Creating,
            },
        });

        workbook = responseData;
    } catch (error) {
        if (isGatewayError(error) && error.error.status === HttpStatusCode.Conflict) {
            throw new AppError(error.error.message, {
                code: META_MANAGER_ERROR.WORKBOOK_ALREADY_EXISTS,
            });
        }

        throw error;
    }

    const workbookImport = await WorkbookImportModel.query(db.primary)
        .insert({
            createdBy: user?.userId ?? SYSTEM_USER.ID,
            expiredAt: raw(`NOW() + INTERVAL '?? DAY'`, [WORKBOOK_IMPORT_EXPIRATION_DAYS]),
            meta: {workbookId: workbook.workbookId},
            data: data.export,
        })
        .timeout(WorkbookImportModel.DEFAULT_QUERY_TIMEOUT);

    if (
        data.hash !==
        getExportDataVerificationHash({
            data: data.export,
            secret: ctx.config.exportDataVerificationKey,
        })
    ) {
        ctx.log('WORKBOOK_IMPORT_DATA_HASH_MISMATCH', {
            importId: workbookImport.importId,
            workbookId: workbook.workbookId,
        });
    }

    await gatewayApi.us.updateWorkbook({
        ctx,
        headers: getDefaultUsHeaders(ctx),
        requestId,
        args: {
            workbookId: workbook.workbookId,
            meta: {...workbook.meta, importId: workbookImport.importId},
        },
    });

    await startImportWorkbookWorkflow({
        importId: workbookImport.importId,
        workbookId: workbook.workbookId,
        tenantId,
        requestId,
    });

    ctx.log('START_WORKBOOK_IMPORT_FINISH', {
        importId: workbookImport.importId,
        workbookId: workbook.workbookId,
    });

    return {importId: workbookImport.importId, workbookId: workbook.workbookId};
};
