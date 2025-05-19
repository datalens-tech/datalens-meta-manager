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
import pLimit from 'p-limit';

import {EntryScope} from '../../../gateway/schema/us/types/entry';

import type {createActivities} from './activities';
import type {ImportWorkbookArgs, ImportWorkbookResult} from './types';

export const getWorkbookImportProgress = defineQuery<number, []>('getProgress');

const IMPORT_REQUESTS_CONCURRENCY = 20;

const limit = pLimit(IMPORT_REQUESTS_CONCURRENCY);

const {
    finishImportSuccess,
    finishImportError,
    getImportDataEntriesInfo,
    deleteWorkbook,
    updateWorkbookStatusActive,
    updateWorkbookStatusDeleting,
    importEntry,
    getImportCapabilities,
    checkScopesAvailability,
} = proxyActivities<ReturnType<typeof createActivities>>({
    retry: {
        initialInterval: '1 sec',
        maximumInterval: '20 sec',
        backoffCoefficient: 3,
        maximumAttempts: 5,
    },
    startToCloseTimeout: '20 sec',
});

export const importWorkbook = async (
    workflowArgs: ImportWorkbookArgs,
): Promise<ImportWorkbookResult> => {
    const {importId} = workflowArgs;

    let entriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookImportProgress, (): number => {
        return entriesCount > 0 ? Math.floor((processedEntriesCount * 100) / entriesCount) : 0;
    });

    //
    //

    try {
        const [{entryIdsByScope, total}, {importOrder, installationAvailableScopes}] =
            await Promise.all([
                getImportDataEntriesInfo({
                    workflowArgs,
                }),
                getImportCapabilities({workflowArgs}),
            ]);

        entriesCount = total;

        const idMapping: Record<string, string> = {};

        for (const scopesBatch of importOrder) {
            const importEntryPromises = [];

            for (const scope of scopesBatch) {
                if (!entryIdsByScope[scope]) {
                    continue;
                }

                // eslint-disable-next-line @typescript-eslint/no-loop-func
                const scopeImportEntryPromises = entryIdsByScope[scope].map(async (mockEntryId) =>
                    limit(async () => {
                        const {entryId} = await importEntry({
                            workflowArgs,
                            mockEntryId,
                            scope,
                            idMapping,
                        });

                        processedEntriesCount++;
                        idMapping[mockEntryId] = entryId;
                    }),
                );

                importEntryPromises.push(...scopeImportEntryPromises);
            }

            await Promise.all(importEntryPromises);
        }

        await checkScopesAvailability({
            workflowArgs,
            installationAvailableScopes,
            exportedScopes: Object.keys(entryIdsByScope) as EntryScope[],
        });

        /**
         *  If some scopes not available for current installation,
         *  some entries will be skipped therefore we must push forward progress.
         */
        processedEntriesCount = entriesCount;

        await updateWorkbookStatusActive({workflowArgs});

        await finishImportSuccess({workflowArgs});
    } catch (error) {
        let failureType: string | undefined;

        if (error instanceof ActivityFailure && error.cause instanceof ApplicationFailure) {
            failureType = error.cause.type || undefined;
        }

        await CancellationScope.nonCancellable(async () => {
            try {
                await updateWorkbookStatusDeleting({workflowArgs});
            } catch (_error) {
                log.error('Failed to update deleting workbook status.', {error: _error});
            }

            try {
                await finishImportError({workflowArgs, failureType});
            } catch (_error) {
                log.error('Failed to finish import with error.', {error: _error});
            }

            /**
             * The workbook needs to continue to exist for some time
             * because we use it to check access to the import.
             */
            await sleep(30 * 1000);

            try {
                await deleteWorkbook({workflowArgs});
            } catch (_error) {
                log.error('Failed to delete workbook.', {error: _error});
            }
        });

        throw error;
    }

    return {importId};
};
