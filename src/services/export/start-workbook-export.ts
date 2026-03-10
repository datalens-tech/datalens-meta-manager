import {raw} from 'objection';

import {startExportWorkbookWorkflow} from '../../components/temporal/client';
import {checkWorkbookAccessByPermissions, getDefaultUsHeaders} from '../../components/us/utils';
import {
    SYSTEM_USER,
    WORKBOOK_EXPORT_DATA_VERSION,
    WORKBOOK_EXPORT_EXPIRATION_DAYS,
} from '../../constants';
import {ExportModel} from '../../db/models';
import {getPrimary} from '../../db/utils';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';
import {encodeId} from '../../utils';
import {getCtxInfo, getCtxRequestIdWithFallback, getCtxTenantIdUnsafe} from '../../utils/ctx';

type StartWorkbookExportArgs = {
    workbookId: string;
};

export const startWorkbookExport = async (
    {ctx, trx}: ServiceArgs,
    args: StartWorkbookExportArgs,
): Promise<ExportModel> => {
    const {workbookId} = args;

    ctx.log('START_WORKBOOK_EXPORT_START', {
        workbookId,
    });

    const requestId = getCtxRequestIdWithFallback(ctx);

    const {gatewayApi} = registry.getGatewayApi();
    const {user} = getCtxInfo(ctx);
    const tenantId = getCtxTenantIdUnsafe(ctx);

    const {responseData} = await gatewayApi.us.getWorkbook({
        ctx,
        headers: getDefaultUsHeaders(ctx),
        requestId,
        args: {workbookId, includePermissionsInfo: true},
    });

    checkWorkbookAccessByPermissions({permissions: responseData.permissions});

    const {checkExportAvailability} = registry.common.functions.get();

    await checkExportAvailability({ctx});

    const result = await ExportModel.query(getPrimary(trx))
        .insert({
            createdBy: user.userId ?? SYSTEM_USER.ID,
            expiredAt: raw(`NOW() + INTERVAL '?? DAY'`, [WORKBOOK_EXPORT_EXPIRATION_DAYS]),
            meta: {
                version: WORKBOOK_EXPORT_DATA_VERSION,
                sourceWorkbookId: responseData.workbookId,
            },
            tenantId,
        })
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    await startExportWorkbookWorkflow({
        exportId: result.exportId,
        workbookId: responseData.workbookId,
        tenantId,
        requestId,
    });

    const encodedExportId = encodeId(result.exportId);

    ctx.log('START_WORKBOOK_EXPORT_FINISH', {
        exportId: encodedExportId,
    });

    return result;
};
