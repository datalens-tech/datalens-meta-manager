import {CancellationScope, defineQuery, proxyActivities, setHandler} from '@temporalio/workflow';

import type {createActivities} from './activities';
import type {ExportWorkbookArgs, ExportWorkbookResult} from './types';

export const getWorkbookExportProgress = defineQuery<number, []>('getProgress');

const {
    finishExportSuccess,
    finishExportError,
    getWorkbookContent,
    exportConnection,
    exportDataset,
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

export const exportWorkbook = async ({
    exportId,
    workbookId,
}: ExportWorkbookArgs): Promise<ExportWorkbookResult> => {
    let entriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookExportProgress, (): number => {
        return entriesCount > 0 ? Math.floor((processedEntriesCount * 100) / entriesCount) : 0;
    });

    try {
        const {connections, datasets, charts, dashboards, reports} = await getWorkbookContent({
            workbookId,
        });

        entriesCount =
            connections.length +
            datasets.length +
            charts.length +
            dashboards.length +
            reports.length;

        const connectionIdMapping: Record<string, string> = {};

        const exportConnectionPromises = connections.map(async (connectionId, index) => {
            const mockConnectionId = `connectionId_${index}`;

            await exportConnection({exportId, connectionId, mockConnectionId});

            processedEntriesCount++;
            connectionIdMapping[connectionId] = mockConnectionId;
        });

        await Promise.all(exportConnectionPromises);

        const datasetIdMapping: Record<string, string> = {};

        const exportDatasetPromises = datasets.map(async (datasetId, index) => {
            const mockDatasetId = `datasetId_${index}`;

            await exportDataset({
                exportId,
                datasetId,
                mockDatasetId,
                idMapping: connectionIdMapping,
            });

            processedEntriesCount++;
            datasetIdMapping[datasetId] = mockDatasetId;
        });

        await Promise.all(exportDatasetPromises);

        await finishExportSuccess({exportId});
    } catch (error) {
        await CancellationScope.nonCancellable(() => finishExportError({exportId, error}));

        throw error;
    }

    return {exportId};
};
