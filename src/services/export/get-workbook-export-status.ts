import {AppError} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

import {getClient} from '../../components/temporal/client';
import {getWorkbookExportProgress} from '../../components/temporal/workflows';
import {TRANSFER_ERROR} from '../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../db/models';
import {WorkbookExportErrors} from '../../db/models/workbook-export/types';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';

type GetWorkbookExportStatusArgs = {
    exportId: string;
};

export type GetWorkbookExportStatusResult = {
    status: ExportStatus;
    exportId: string;
    progress: number;
    errors: WorkbookExportErrors | null;
};

export const getWorkbookExportStatus = async (
    {ctx}: ServiceArgs,
    args: GetWorkbookExportStatusArgs,
): Promise<GetWorkbookExportStatusResult> => {
    const {exportId} = args;

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_START', {
        exportId,
    });

    const client = await getClient();
    const handle = client.workflow.getHandle(exportId);

    const workbookExportPromise = WorkbookExportModel.query(WorkbookExportModel.replica)
        .select([
            ExportModelColumn.ExportId,
            ExportModelColumn.Status,
            ExportModelColumn.Errors,
            ExportModelColumn.Meta,
        ])
        .where({
            [ExportModelColumn.ExportId]: exportId,
        })
        .first()
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    const [progress, workbookExport] = await Promise.all([
        handle.query(getWorkbookExportProgress),
        workbookExportPromise,
    ]);

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

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_FINISH');

    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        progress,
        errors: workbookExport.errors,
    };
};
