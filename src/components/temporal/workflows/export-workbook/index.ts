import {defineQuery, proxyActivities, setHandler} from '@temporalio/workflow';

import type {createActivities} from './activities';
import type {ExportWorkbookArgs, ExportWorkbookResult} from './types';

export const getWorkbookExportProgress = defineQuery<number, []>('getProgress');

const {finishExport, getWorkbookContent, exportConnection, exportDataset} = proxyActivities<
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

export const exportWorkbook = async ({
    exportId,
    workbookId,
}: ExportWorkbookArgs): Promise<ExportWorkbookResult> => {
    let entriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookExportProgress, (): number => {
        return entriesCount > 0 ? Math.floor((processedEntriesCount * 100) / entriesCount) : 0;
    });

    const {connections, datasets, charts, dashboards, reports} = await getWorkbookContent({
        workbookId,
    });

    entriesCount =
        connections.length + datasets.length + charts.length + dashboards.length + reports.length;

    const connectionIdMapping: Record<string, string> = {};

    for (let i = 0; i < connections.length; i++) {
        const connectionId = connections[i];
        const mockConnectionId = `connectionId_${i}`;

        await exportConnection({exportId, connectionId, mockConnectionId});

        connectionIdMapping[connectionId] = mockConnectionId;
        processedEntriesCount++;
    }

    for (let i = 0; i < datasets.length; i++) {
        const datasetId = datasets[i];
        const mockDatasetId = `datasetId_${i}`;

        await exportDataset({
            exportId,
            datasetId,
            mockDatasetId,
            idMapping: connectionIdMapping,
        });

        processedEntriesCount++;
    }

    await finishExport({exportId});

    return {exportId};
};
