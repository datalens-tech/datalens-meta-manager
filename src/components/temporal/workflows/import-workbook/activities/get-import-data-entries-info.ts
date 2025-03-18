import {ApplicationFailure} from '@temporalio/common';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type GetImportDataEntriesInfoArgs = {
    importId: string;
};

type GetImportDataEntriesInfoResult = {
    connectionIds: string[];
    datasetIds: string[];
};

export const getImportDataEntriesInfo = async (
    _: ActivitiesDeps,
    {importId}: GetImportDataEntriesInfoArgs,
): Promise<GetImportDataEntriesInfoResult> => {
    const workbookImport = await WorkbookImportModel.query(WorkbookImportModel.primary)
        .select()
        .where({
            [ImportModelColumn.ImportId]: importId,
        })
        .first()
        .timeout(WorkbookImportModel.DEFAULT_QUERY_TIMEOUT);

    if (!workbookImport) {
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `Workbook import ${importId} not exist.`,
        });
    }

    const {data} = workbookImport;

    return {
        connectionIds: data.connections ? Object.keys(data.connections) : [],
        datasetIds: data.datasets ? Object.keys(data.datasets) : [],
    };
};
