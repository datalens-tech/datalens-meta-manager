import {AppError} from '@gravity-ui/nodekit';
import {raw} from 'objection';

import {getClient} from '../../components/temporal/client';
import {getWorkbookExportProgress} from '../../components/temporal/workflows';
import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {
    ExportEntryModel,
    ExportEntryModelColumn,
    ExportModel,
    ExportModelColumn,
    ExportStatus,
} from '../../db/models';
import {ExportNotifications} from '../../db/models/export/types';
import {getReplica} from '../../db/utils';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';
import {encodeId} from '../../utils';

type GetWorkbookExportStatusArgs = {
    exportId: BigIntId;
};

const selectedExportColumns = [
    ExportModelColumn.ExportId,
    ExportModelColumn.Status,
    ExportModelColumn.Meta,
] as const;

type SelectedExportModel = Pick<ExportModel, ArrayElement<typeof selectedExportColumns>> & {
    notifications: ExportNotifications | null;
};

const selectedEntryColumns = [
    ExportEntryModelColumn.ExportId,
    ExportEntryModelColumn.EntryId,
    ExportEntryModelColumn.Scope,
    ExportEntryModelColumn.Notifications,
] as const;

type SelectedExportEntryModel = Pick<ExportEntryModel, ArrayElement<typeof selectedEntryColumns>>;

export type GetWorkbookExportStatusResult = {
    status: ExportStatus;
    exportId: BigIntId;
    progress: number;
    notifications: ExportNotifications | null;
    entries?: SelectedExportEntryModel[];
};

export const getWorkbookExportStatus = async (
    {ctx, trx}: ServiceArgs,
    args: GetWorkbookExportStatusArgs,
): Promise<GetWorkbookExportStatusResult> => {
    const {exportId} = args;

    const encodedExportId = encodeId(exportId);

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_START', {
        exportId: encodedExportId,
    });

    const client = await getClient();
    const handle = client.workflow.getHandle(encodedExportId);

    const workbookExportPromise = ExportModel.query(getReplica(trx))
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
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    const [progress, workbookExport]: [number, SelectedExportModel | undefined] = await Promise.all(
        [handle.query(getWorkbookExportProgress), workbookExportPromise],
    );

    if (!workbookExport) {
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST, {
            code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST,
        });
    }

    const {sourceWorkbookId} = workbookExport.meta;

    await checkWorkbookAccessById({ctx, workbookId: sourceWorkbookId});

    let entries: SelectedExportEntryModel[] | undefined;

    if (
        workbookExport.status === ExportStatus.Error ||
        workbookExport.status === ExportStatus.Success
    ) {
        entries = await ExportEntryModel.query(getReplica(trx))
            .select(selectedEntryColumns)
            .where({
                [ExportEntryModelColumn.ExportId]: exportId,
            })
            .timeout(ExportEntryModel.DEFAULT_QUERY_TIMEOUT);
    }

    ctx.log('GET_WORKBOOK_EXPORT_STATUS_FINISH');

    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        notifications: workbookExport.notifications,
        progress,
        entries,
    };
};
