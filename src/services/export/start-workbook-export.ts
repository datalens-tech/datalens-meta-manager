import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {startExportWorkbookWorkflow} from '../../components/temporal/client';
import {WORKBOOK_EXPORT_DATA_VERSION, WORKBOOK_EXPORT_EXPIRATION_DAYS} from '../../constants';
import {ExportModel} from '../../db/models';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';

type StartWorkbookExportArgs = {
    workbookId: string;
};

export const startWorkbookExport = async (
    {ctx}: ServiceArgs,
    args: StartWorkbookExportArgs,
): Promise<ExportModel> => {
    const {workbookId} = args;

    ctx.log('START_WORKBOOK_EXPORT_START', {
        workbookId,
    });

    const {gatewayApi} = registry.getGatewayApi();

    const {responseData} = await gatewayApi.us._getWorkbook({
        ctx,
        headers: {},
        requestId: ctx.get('requestId') ?? uuidv4(),
        args: {workbookId, includePermissionsInfo: true},
    });

    const user = ctx.get('user');

    const result = await ExportModel.query(ExportModel.replica)
        .insert({
            createdBy: user?.userId ?? '',
            expiredAt: raw(`NOW() + INTERVAL '? DAY'`, [WORKBOOK_EXPORT_EXPIRATION_DAYS]),
            data: {version: WORKBOOK_EXPORT_DATA_VERSION},
        })
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    await startExportWorkbookWorkflow({
        exportId: result.exportId,
        workbookId: responseData.workbookId,
    });

    ctx.log('START_WORKBOOK_EXPORT_FINISH', {
        exportId: result.exportId,
    });

    return result;
};
