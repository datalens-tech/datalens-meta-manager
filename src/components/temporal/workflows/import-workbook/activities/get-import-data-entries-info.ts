import {ApplicationFailure} from '@temporalio/common';

import {ImportModel, ImportModelColumn} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type GetImportDataEntriesInfoArgs = {
    importId: string;
};

export type GetImportDataEntriesInfoResult = {
    connectionIds: string[];
    datasetIds: string[];
};

export const getImportDataEntriesInfo = async (
    _: ActivitiesDeps,
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
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `Workbook import ${importId} not exist.`,
        });
    }

    const {data} = workbookImport;

    return {
        // TODO: fix and check data types
        connectionIds: Object.keys(data.connections),
        datasetIds: Object.keys(data.datasets),
    };
};
