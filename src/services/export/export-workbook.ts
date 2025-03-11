import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {startExportWorkbook} from '../../components/temporal/client';
import {ExportModel, ExportModelColumn} from '../../db/models';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';

type ExportWorkbookArgs = {
    workbookId: string;
};

export const exportWorkbook = async (
    {ctx}: ServiceArgs,
    args: ExportWorkbookArgs,
): Promise<ExportModel> => {
    const {workbookId} = args;

    ctx.log('EXPORT_WORKBOOK_REQUEST_START', {
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

    await startExportWorkbook({
        exportId: result.exportId,
        workbookId: responseData.workbookId,
    });

    ctx.log('EXPORT_WORKBOOK_REQUEST_FINISH', {
        exportId: result.exportId,
    });

    return result;
};
