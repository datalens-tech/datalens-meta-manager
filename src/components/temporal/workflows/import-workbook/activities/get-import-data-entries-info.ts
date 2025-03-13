import {AppError} from '@gravity-ui/nodekit';

import {TRANSFER_ERROR} from '../../../../../constants';
import {ImportModelColumn} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type GetImportDataEntriesInfoArgs = {
    importId: string;
};

export type GetImportDataEntriesInfoResult = {
    connectionIds: string[];
    datasetIds: string[];
};

export const getImportDataEntriesInfo = async (
    {models: {ImportModel}}: ActivitiesDeps,
    {importId}: GetImportDataEntriesInfoArgs,
): Promise<GetImportDataEntriesInfoResult> => {
    const workbookImport = await ImportModel.query(ImportModel.primary)
        .select()
        .where({
            [ImportModelColumn.ImportId]: importId,
        })
        .first()
        .timeout(ImportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookImport) {
        throw new AppError(TRANSFER_ERROR.IMPORT_NOT_EXIST, {
            code: TRANSFER_ERROR.IMPORT_NOT_EXIST,
        });
    }

    const {data} = workbookImport;

    return {
        // TODO: fix and check data types
        connectionIds: Object.keys(data.connections),
        datasetIds: Object.keys(data.datasets),
    };
};
