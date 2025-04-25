import {AppError} from '@gravity-ui/nodekit';
import {raw} from 'objection';

import {getClient} from '../../components/temporal/client';
import {getWorkbookExportProgress} from '../../components/temporal/workflows';
import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../db/models';
import {WorkbookExportNotifications} from '../../db/models/workbook-export/types';
import {registry} from '../../registry';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';

type GetWorkbookExportStatusArgs = {
    exportId: BigIntId;
};

export type GetWorkbookExportStatusResult = {
    status: ExportStatus;
    exportId: BigIntId;
    progress: number;
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

    const {db} = registry.getDbInstance();

    const workbookExportPromise = WorkbookExportModel.query(db.replica)
        .select([
            ExportModelColumn.ExportId,
            ExportModelColumn.Status,
            ExportModelColumn.Meta,
            // select notifications column only if status is success or error
            raw(`CASE WHEN ?? = ? OR ?? = ? THEN ?? ELSE NULL END AS ??`, [
                ExportModelColumn.Status,
                ExportStatus.Success,
                ExportModelColumn.Status,
                ExportStatus.Error,
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
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST, {
            code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST,
        });
    }

    const {sourceWorkbookId} = workbookExport.meta;

    await checkWorkbookAccessById({ctx, workbookId: sourceWorkbookId});

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_FINISH');

    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        notifications: workbookExport.notifications,
        progress,
    };
};
