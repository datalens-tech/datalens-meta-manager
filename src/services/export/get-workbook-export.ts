import {AppError} from '@gravity-ui/nodekit';

import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {ExportModelColumn, ExportStatus, WorkbookExportModel} from '../../db/models';
import {ExportEntryModelColumn} from '../../db/models/export-entry';
import {WorkbookExportData} from '../../db/models/workbook-export/types';
import {registry} from '../../registry';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';
import {WorkbookExportDataWithHash} from '../../types/workbook-export';
import {encodeId} from '../../utils';
import {getExportDataVerificationHash} from '../../utils/export';

type GetWorkbookExportArgs = {
    exportId: BigIntId;
};

export type GetWorkbookExportResult = {
    exportId: BigIntId;
    status: ExportStatus;
    data: WorkbookExportDataWithHash;
};

const selectedEntryColumns = [
    ExportEntryModelColumn.ExportId,
    ExportEntryModelColumn.MockEntryId,
    ExportEntryModelColumn.Scope,
    ExportEntryModelColumn.Data,
];

export const getWorkbookExport = async (
    {ctx}: ServiceArgs,
    args: GetWorkbookExportArgs,
): Promise<GetWorkbookExportResult> => {
    const {exportId} = args;

    const encodedExportId = encodeId(exportId);

    ctx.log('GET_WORKBOOK_EXPORT_START', {
        exportId: encodedExportId,
    });

    const {db} = registry.getDbInstance();

    const workbookExport = await WorkbookExportModel.query(db.replica)
        .select()
        .where({
            [ExportModelColumn.ExportId]: exportId,
        })
        .withGraphJoined(`[entries(entriesModifier)]`)
        .modifiers({
            entriesModifier(builder) {
                builder.select(selectedEntryColumns);
            },
        })
        .first()
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookExport) {
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST, {
            code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST,
        });
    }

    const {sourceWorkbookId} = workbookExport.meta;

    await checkWorkbookAccessById({ctx, workbookId: sourceWorkbookId});

    if (workbookExport.status !== ExportStatus.Success) {
        throw new AppError(META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED, {
            code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED,
        });
    }

    const {checkExportAvailability} = registry.common.functions.get();

    await checkExportAvailability({ctx});

    let exportData: WorkbookExportData;

    if (workbookExport.meta.version) {
        exportData = {
            version: workbookExport.meta.version,
            entries: (workbookExport.entries ?? []).reduce(
                (acc, {scope, mockEntryId, data}) => {
                    if (!acc[scope]) {
                        acc[scope] = {};
                    }

                    acc[scope][mockEntryId] = data;

                    return acc;
                },
                {} as WorkbookExportData['entries'],
            ),
        };
    } else {
        exportData = workbookExport.data;
    }

    const hash = getExportDataVerificationHash({
        data: exportData,
        secret: ctx.config.exportDataVerificationKey,
    });

    ctx.log('GET_WORKBOOK_EXPORT_FINISH');

    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        data: {
            export: exportData,
            hash,
        },
    };
};
