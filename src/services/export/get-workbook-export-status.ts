import {AppError} from '@gravity-ui/nodekit';
import {raw} from 'objection';

import {getClient} from '../../components/temporal/client';
import {getWorkbookExportProgress} from '../../components/temporal/workflows';
import {checkWorkbookUpdateAccessBindingsPermission} from '../../components/us/utils';
import {TRANSFER_ERROR} from '../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../db/models';
import {
    WorkbookExportErrors,
    WorkbookExportNotifications,
} from '../../db/models/workbook-export/types';
import {ServiceArgs} from '../../types/service';

type GetWorkbookExportStatusArgs = {
    exportId: string;
};

export type GetWorkbookExportStatusResult = {
    status: ExportStatus;
    exportId: string;
    progress: number;
    errors: WorkbookExportErrors | null;
    notifications: WorkbookExportNotifications | null;
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
            ExportModelColumn.Meta,
            // select errors column only if status is error
            raw(`CASE WHEN ?? = ? THEN ?? ELSE NULL END AS ??`, [
                ExportModelColumn.Status,
                ExportStatus.Error,
                ExportModelColumn.Errors,
                ExportModelColumn.Errors,
            ]),
            // select notifications column only if status is success
            raw(`CASE WHEN ?? = ? THEN ?? ELSE NULL END AS ??`, [
                ExportModelColumn.Status,
                ExportStatus.Success,
                ExportModelColumn.Notifications,
                ExportModelColumn.Notifications,
            ]),
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

    await checkWorkbookUpdateAccessBindingsPermission({ctx, workbookId: sourceWorkbookId});

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_FINISH');

    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        errors: workbookExport.errors,
        notifications: workbookExport.notifications,
        progress,
    };
};
