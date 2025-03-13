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

    let totalEntriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookImportProgress, (): number => {
        return totalEntriesCount > 0
            ? Math.floor((processedEntriesCount * 100) / totalEntriesCount)
            : 0;
    });

    const {connectionIds, datasetIds} = await getImportDataEntriesInfo({importId});

    totalEntriesCount = connectionIds.length + datasetIds.length;

    const connectionIdMapping: Record<string, string> = {};

    for (let i = 0; i < connectionIds.length; i++) {
        const mockConnectionId = connectionIds[i];

        const {connectionId} = await importConnection({
            importId,
            workbookId,
            mockConnectionId,
        });

        connectionIdMapping[mockConnectionId] = connectionId;

        processedEntriesCount++;
    }

    await finishImport({importId});

    return {importId};
};
