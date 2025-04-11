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

import {EntryScope} from '../../../gateway/schema/us/types/entry';

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
        deleteWorkbook,
        updateWorkbookStatusActive,
        updateWorkbookStatusDeleting,
        importEntry,
    } = proxyActivities<ReturnType<typeof createActivities>>({
        // TODO: check config values
        retry: {
            initialInterval: '1 sec',
            maximumInterval: '4 sec',
            backoffCoefficient: 2,
            maximumAttempts: 3,
        },
        startToCloseTimeout: '1 min',
    });

    let entriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookImportProgress, (): number => {
        return entriesCount > 0 ? Math.floor((processedEntriesCount * 100) / entriesCount) : 0;
    });

    try {
        const {connectionIds, datasetIds, chartIds, dashIds} = await getImportDataEntriesInfo({
            importId,
        });

        entriesCount = connectionIds.length + datasetIds.length + chartIds.length + dashIds.length;

        const idMapping: Record<string, string> = {};

        const importConnectionPromises = connectionIds.map(async (mockConnectionId) => {
            const {entryId} = await importEntry({
                importId,
                workbookId,
                mockEntryId: mockConnectionId,
                scope: EntryScope.Connection,
                idMapping,
            });

            processedEntriesCount++;
            idMapping[mockConnectionId] = entryId;
        });

        await Promise.all(importConnectionPromises);

        const importDatasetPromises = datasetIds.map(async (mockDatasetId) => {
            const {entryId} = await importEntry({
                importId,
                workbookId,
                mockEntryId: mockDatasetId,
                scope: EntryScope.Dataset,
                idMapping,
            });

            processedEntriesCount++;
            idMapping[mockDatasetId] = entryId;
        });

        await Promise.all(importDatasetPromises);

        const importChartPromises = chartIds.map(async (mockChartId) => {
            const {entryId} = await importEntry({
                importId,
                workbookId,
                mockEntryId: mockChartId,
                scope: EntryScope.Widget,
                idMapping,
            });

            processedEntriesCount++;
            idMapping[mockChartId] = entryId;
        });

        await Promise.all(importChartPromises);

        const importDashPromises = dashIds.map(async (mockDashId) => {
            const {entryId} = await importEntry({
                importId,
                workbookId,
                mockEntryId: mockDashId,
                scope: EntryScope.Dash,
                idMapping,
            });

            processedEntriesCount++;
            idMapping[mockDashId] = entryId;
        });

        await Promise.all(importDashPromises);

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
