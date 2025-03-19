import {
    CancellationScope,
    defineQuery,
    proxyActivities,
    setHandler,
    sleep,
} from '@temporalio/workflow';

import type {createActivities} from './activities';
import type {ImportWorkbookArgs, ImportWorkbookResult} from './types';

export const getWorkbookImportProgress = defineQuery<number, []>('getProgress');

export const importWorkbook = async ({
    importId,
    workbookId,
}: ImportWorkbookArgs): Promise<ImportWorkbookResult> => {
    const {
        finishImportSuccess,
        finishImportError,
        getImportDataEntriesInfo,
        importConnection,
        deleteWorkbook,
    } = proxyActivities<ReturnType<typeof createActivities>>({
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

    try {
        const {connectionIds, datasetIds} = await getImportDataEntriesInfo({importId});

        entriesCount = connectionIds.length + datasetIds.length;

        const connectionIdMapping: Record<string, string> = {};

        const importConnectionPromises = connectionIds.map(async (mockConnectionId) => {
            const {connectionId} = await importConnection({
                importId,
                workbookId,
                mockConnectionId,
            });

            processedEntriesCount++;
            connectionIdMapping[mockConnectionId] = connectionId;
        });

        await Promise.all(importConnectionPromises);

        await sleep(400000);

        // TODO: enable when import dataset endpoint is fixed
        // const importDatasetPromises = datasetIds.map(async (mockDatasetId) => {
        //     await importDataset({
        //         importId,
        //         workbookId,
        //         mockDatasetId,
        //         idMapping: connectionIdMapping,
        //     });

        //     processedEntriesCount++;
        // });

        // await Promise.all(importDatasetPromises);

        await finishImportSuccess({importId});
    } catch (error) {
        await CancellationScope.nonCancellable(async () => {
            await Promise.all([deleteWorkbook({workbookId}), finishImportError({importId, error})]);
        });

        throw error;
    }

    return {importId};
};
