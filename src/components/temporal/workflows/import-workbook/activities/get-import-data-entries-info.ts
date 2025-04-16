import {ApplicationFailure} from '@temporalio/common';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';
import {ImportWorkbookArgs} from '../types';

export type GetImportDataEntriesInfoArgs = {
    workflowArgs: ImportWorkbookArgs;
};

type GetImportDataEntriesInfoResult = {
    connectionIds: string[];
    datasetIds: string[];
    chartIds: string[];
    dashIds: string[];
};

export const getImportDataEntriesInfo = async (
    _: ActivitiesDeps,
    {workflowArgs}: GetImportDataEntriesInfoArgs,
): Promise<GetImportDataEntriesInfoResult> => {
    const {importId} = workflowArgs;

    const workbookImport = await WorkbookImportModel.query(WorkbookImportModel.replica)
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
        connectionIds: data.connection ? Object.keys(data.connection) : [],
        datasetIds: data.dataset ? Object.keys(data.dataset) : [],
        chartIds: data.widget ? Object.keys(data.widget) : [],
        dashIds: data.dash ? Object.keys(data.dash) : [],
    };
};
