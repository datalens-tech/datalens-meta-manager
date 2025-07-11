import {AppError} from '@gravity-ui/nodekit';

import {checkWorkbookAccessById} from '../../components/us/utils';
import {META_MANAGER_ERROR} from '../../constants';
import {ExportModel, ExportModelColumn, ExportStatus} from '../../db/models';
import {ExportEntryModel, ExportEntryModelColumn} from '../../db/models/export-entry';
import {getReplica} from '../../db/utils';
import {registry} from '../../registry';
import {BigIntId} from '../../types';
import {ServiceArgs} from '../../types/service';
import {ExportData, WorkbookExportDataWithHash} from '../../types/workbook-export';
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

const entryColumns = [
    ExportEntryModelColumn.ExportId,
    ExportEntryModelColumn.MockEntryId,
    ExportEntryModelColumn.Scope,
    ExportEntryModelColumn.Data,
];

type SelectedExportEntryModel = Pick<ExportEntryModel, ArrayElement<typeof entryColumns>>;

type SelectedExportModel = Omit<ExportModel, 'entries'> & {
    entries?: SelectedExportEntryModel[];
};

const selectedEntryColumns = entryColumns.map(
    (column) => `${ExportEntryModel.tableName}.${column}`,
);

export const getWorkbookExport = async (
    {ctx, trx}: ServiceArgs,
    args: GetWorkbookExportArgs,
): Promise<GetWorkbookExportResult> => {
    const {exportId} = args;

    const encodedExportId = encodeId(exportId);

    ctx.log('GET_WORKBOOK_EXPORT_START', {
        exportId: encodedExportId,
    });

    const workbookExport: SelectedExportModel | undefined = await ExportModel.query(getReplica(trx))
        .select()
        .where({
            [`${ExportModel.tableName}.${ExportModelColumn.ExportId}`]: exportId,
        })
        .withGraphJoined(`[entries(entriesModifier)]`)
        .modifiers({
            entriesModifier(builder) {
                builder.select(selectedEntryColumns);
            },
        })
        .first()
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

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

    const exportData: ExportData = {
        version: workbookExport.meta.version,
        entries: (workbookExport.entries ?? []).reduce<ExportData['entries']>(
            (acc, {scope, mockEntryId, data}) => {
                if (!acc[scope]) {
                    acc[scope] = {};
                }

                acc[scope][mockEntryId] = data;

                return acc;
            },
            {},
        ),
    };

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
