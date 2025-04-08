import {
    ActivityFailure,
    ApplicationFailure,
    CancellationScope,
    defineQuery,
    log,
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
    tenantId,
}: ImportWorkbookArgs): Promise<ImportWorkbookResult> => {
    const {
        finishImportSuccess,
        finishImportError,
        getImportDataEntriesInfo,
        importConnection,
        deleteWorkbook,
        importDataset,
        updateWorkbookStatusActive,
        updateWorkbookStatusDeleting,
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

        const importDatasetPromises = datasetIds.map(async (mockDatasetId) => {
            await importDataset({
                importId,
                workbookId,
                mockDatasetId,
                idMapping: connectionIdMapping,
            });

            processedEntriesCount++;
        });

        await Promise.all(importDatasetPromises);

        await updateWorkbookStatusActive({workbookId, tenantId});

        await finishImportSuccess({importId});
    } catch (error) {
        let failureType: string | undefined;

        if (error instanceof ActivityFailure && error.cause instanceof ApplicationFailure) {
            failureType = error.cause.type || undefined;
        }

        await CancellationScope.nonCancellable(async () => {
            try {
                await updateWorkbookStatusDeleting({workbookId, tenantId});
            } catch (_error) {
                log.error('Failed to update deleting workbook status.', {error: _error});
            }

            try {
                await finishImportError({importId, failureType});
            } catch (_error) {
                log.error('Failed to finish import with error.', {error: _error});
            }

            /**
             * The workbook needs to continue to exist for some
             * time because we use it to check access to the import.
             */
            await sleep(60 * 1000 * 5);

            try {
                await deleteWorkbook({workbookId});
            } catch (_error) {
                log.error('Failed to delete workbook.', {error: _error});
            }
        });

        throw error;
    }

    return {importId};
};
