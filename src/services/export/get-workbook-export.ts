import {AppError} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

import {TRANSFER_ERROR} from '../../constants';
import {ExportModelColumn, WorkbookExportModel} from '../../db/models';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';

type GetWorkbookExportArgs = {
    exportId: string;
};

export type GetWorkbookExportResult = WorkbookExportModel;

export const getWorkbookExport = async (
    {ctx}: ServiceArgs,
    args: GetWorkbookExportArgs,
): Promise<GetWorkbookExportResult> => {
    const {exportId} = args;

    ctx.log('GET_WORKBOOK_EXPORT_START', {
        exportId,
    });

    const workbookExport = await WorkbookExportModel.query(WorkbookExportModel.replica)
        .select()
        .where({
            [ExportModelColumn.ExportId]: exportId,
        })
        .first()
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookExport) {
        throw new AppError(TRANSFER_ERROR.EXPORT_NOT_EXIST, {
            code: TRANSFER_ERROR.EXPORT_NOT_EXIST,
        });
    }

    const {sourceWorkbookId} = workbookExport.meta;

    const {gatewayApi} = registry.getGatewayApi();

    const {
        responseData: {permissions},
    } = await gatewayApi.us.getWorkbook({
        ctx,
        headers: {},
        requestId: ctx.get('requestId') ?? uuidv4(),
        args: {workbookId: sourceWorkbookId, includePermissionsInfo: true},
    });

    if (!permissions?.update) {
        throw new AppError('The user must have update permissions to perform this action.', {
            code: TRANSFER_ERROR.WORKBOOK_OPERATION_FORBIDDEN,
        });
    }

    ctx.log('GET_WORKBOOK_EXPORT_FINISH');

    return workbookExport;
};
