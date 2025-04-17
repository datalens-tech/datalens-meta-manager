import {
    ActivityFailure,
    ApplicationFailure,
    CancellationScope,
    defineQuery,
    proxyActivities,
    setHandler,
} from '@temporalio/workflow';

import {EntryScope} from '../../../gateway/schema/us/types/entry';

import type {createActivities} from './activities';
import type {ExportWorkbookArgs, ExportWorkbookResult} from './types';

export const getWorkbookExportProgress = defineQuery<number, []>('getProgress');

const {finishExportSuccess, finishExportError, getWorkbookContent, exportEntry} = proxyActivities<
    ReturnType<typeof createActivities>
>({
    retry: {
        initialInterval: '1 sec',
        maximumInterval: '20 sec',
        backoffCoefficient: 3,
        maximumAttempts: 5,
    },
    startToCloseTimeout: '20 sec',
});

export const exportWorkbook = async (
    workflowArgs: ExportWorkbookArgs,
): Promise<ExportWorkbookResult> => {
    const {exportId} = workflowArgs;

    let entriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookExportProgress, (): number => {
        return entriesCount > 0 ? Math.floor((processedEntriesCount * 100) / entriesCount) : 0;
    });

    try {
        const {connections, datasets, charts, dashboards} = await getWorkbookContent({
            workflowArgs,
        });

        entriesCount = connections.length + datasets.length + charts.length + dashboards.length;

        const idMapping: Record<string, string> = {};

        const exportConnectionPromises = connections.map(async (connectionId, index) => {
            const mockConnectionId = `connectionId_${index}`;

            await exportEntry({
                workflowArgs,
                entryId: connectionId,
                mockEntryId: mockConnectionId,
                scope: EntryScope.Connection,
                idMapping,
            });

            processedEntriesCount++;
            idMapping[connectionId] = mockConnectionId;
        });

        await Promise.all(exportConnectionPromises);

        const exportDatasetPromises = datasets.map(async (datasetId, index) => {
            const mockDatasetId = `datasetId_${index}`;

            await exportEntry({
                workflowArgs,
                entryId: datasetId,
                mockEntryId: mockDatasetId,
                scope: EntryScope.Dataset,
                idMapping,
            });

            processedEntriesCount++;
            idMapping[datasetId] = mockDatasetId;
        });

        await Promise.all(exportDatasetPromises);

        const exportChartPromises = charts.map(async (chartId, index) => {
            const mockChartId = `chartId_${index}`;

            await exportEntry({
                workflowArgs,
                entryId: chartId,
                mockEntryId: mockChartId,
                scope: EntryScope.Widget,
                idMapping,
            });

            processedEntriesCount++;
            idMapping[chartId] = mockChartId;
        });

        await Promise.all(exportChartPromises);

        const exportDashboardPromises = dashboards.map(async (dashId, index) => {
            const mockDashId = `dashId_${index}`;

            await exportEntry({
                workflowArgs,
                entryId: dashId,
                mockEntryId: mockDashId,
                scope: EntryScope.Dash,
                idMapping,
            });

            processedEntriesCount++;
        });

        await Promise.all(exportDashboardPromises);

        await finishExportSuccess({workflowArgs});
    } catch (error) {
        let failureType: string | undefined;

        if (error instanceof ActivityFailure && error.cause instanceof ApplicationFailure) {
            failureType = error.cause.type || undefined;
        }

        await CancellationScope.nonCancellable(() =>
            finishExportError({workflowArgs, failureType}),
        );

        throw error;
    }

    return {exportId};
};
