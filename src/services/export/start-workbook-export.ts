import {raw} from 'objection';

import {startExportWorkbookWorkflow} from '../../components/temporal/client';
import {checkWorkbookAccessByPermissions} from '../../components/us/utils';
import {
    AUTHORIZATION_HEADER,
    WORKBOOK_EXPORT_DATA_VERSION,
    WORKBOOK_EXPORT_EXPIRATION_DAYS,
} from '../../constants';
import {WorkbookExportModel} from '../../db/models';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';
import {createAuthHeader} from '../../utils/auth';
import {getCtxRequestIdWithFallback, getCtxUser} from '../../utils/ctx';

type StartWorkbookExportArgs = {
    workbookId: string;
};

export const startWorkbookExport = async (
    {ctx}: ServiceArgs,
    args: StartWorkbookExportArgs,
): Promise<WorkbookExportModel> => {
    const {workbookId} = args;

    ctx.log('START_WORKBOOK_EXPORT_START', {
        workbookId,
    });

    const {gatewayApi} = registry.getGatewayApi();

    const user = getCtxUser(ctx);

    const {responseData} = await gatewayApi.us.getWorkbook({
        ctx,
        headers: {
            [AUTHORIZATION_HEADER]: createAuthHeader(user.accessToken),
        },
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {workbookId, includePermissionsInfo: true},
    });

    checkWorkbookAccessByPermissions({permissions: responseData.permissions});

    const result = await WorkbookExportModel.query(WorkbookExportModel.primary)
        .insert({
            createdBy: user.userId,
            expiredAt: raw(`NOW() + INTERVAL '?? DAY'`, [WORKBOOK_EXPORT_EXPIRATION_DAYS]),
            data: {version: WORKBOOK_EXPORT_DATA_VERSION},
            meta: {sourceWorkbookId: responseData.workbookId},
        })
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    await startExportWorkbookWorkflow({
        exportId: result.exportId,
        workbookId: responseData.workbookId,
    });

    ctx.log('START_WORKBOOK_EXPORT_FINISH', {
        exportId: result.exportId,
    });

    return result;
};
