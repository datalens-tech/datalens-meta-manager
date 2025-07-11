import {ApplicationFailure} from '@temporalio/common';

import {ImportModel, ImportModelColumn} from '../../../../../db/models';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {ImportWorkbookArgs} from '../types';

export type GetImportDataEntriesInfoArgs = {
    workflowArgs: ImportWorkbookArgs;
};

type GetImportDataEntriesInfoResult = {
    entryIdsByScope: {[key in EntryScope]?: string[]};
    total: number;
};

export const getImportDataEntriesInfo = async (
    _: ActivitiesDeps,
    {workflowArgs}: GetImportDataEntriesInfoArgs,
): Promise<GetImportDataEntriesInfoResult> => {
    const {importId} = workflowArgs;

    const workbookImport = await ImportModel.query(ImportModel.replica)
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

    const {
        data: {entries},
    } = workbookImport;

    const entryIdsByScope: {[key in EntryScope]?: string[]} = {};
    let total = 0;

    for (const scope of Object.keys(entries) as EntryScope[]) {
        const ids = entries[scope] ? Object.keys(entries[scope]) : [];

        entryIdsByScope[scope] = ids;
        total += ids.length;
    }

    return {
        entryIdsByScope,
        total,
    };
};
