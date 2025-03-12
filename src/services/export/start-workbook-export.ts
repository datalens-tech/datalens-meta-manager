import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {startExportWorkbookWorkflow} from '../../components/temporal/client';
import {ExportModel, ExportModelColumn} from '../../db/models';
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

    const result = await ExportModel.query(ExportModel.replica)
        .insert({
            [ExportModelColumn.CreatedBy]: 'mock-user-id',
            [ExportModelColumn.ExpiredAt]: raw(`NOW() + INTERVAL '?? DAY'`, [1]),
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
