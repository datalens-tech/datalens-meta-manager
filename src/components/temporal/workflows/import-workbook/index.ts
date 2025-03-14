import {defineQuery, proxyActivities, setHandler} from '@temporalio/workflow';

import type {createActivities} from './activities';
import type {ImportWorkbookArgs, ImportWorkbookResult} from './types';

export const getWorkbookImportProgress = defineQuery<number, []>('getProgress');

export const importWorkbook = async ({
    importId,
    workbookId,
}: ImportWorkbookArgs): Promise<ImportWorkbookResult> => {
    const {finishImport, getImportDataEntriesInfo, importConnection} = proxyActivities<
        ReturnType<typeof createActivities>
    >({
        // TODO: check config values
        retry: {
            initialInterval: '1 sec',
            maximumInterval: '4 sec',
            backoffCoefficient: 2,
            maximumAttempts: 1,
        },
        startToCloseTimeout: '1 min',
    });

    let entriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookImportProgress, (): number => {
        return entriesCount > 0 ? Math.floor((processedEntriesCount * 100) / entriesCount) : 0;
    });

    const {connectionIds, datasetIds} = await getImportDataEntriesInfo({importId});

    entriesCount = connectionIds.length + datasetIds.length;

    const connectionIdMapping: Record<string, string> = {};

    const importConnectionPromises = connectionIds.map((mockConnectionId) => {
        return importConnection({
            importId,
            workbookId,
            mockConnectionId,
        }).then(({connectionId}) => {
            processedEntriesCount++;
            connectionIdMapping[mockConnectionId] = connectionId;
        });
    });

    await Promise.all(importConnectionPromises);

    await finishImport({importId});

    return {importId};
};
