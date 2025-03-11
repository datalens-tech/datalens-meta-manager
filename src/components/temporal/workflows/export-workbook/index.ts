import {defineQuery, proxyActivities, setHandler} from '@temporalio/workflow';

import type {createActivities} from './activities';
import type {ExportWorkbookArgs, ExportWorkbookResult} from './types';

export const getProgress = defineQuery<number, []>('getProgress');

const {finishExport, getWorkbookContent, exportConnection, exportDataset} = proxyActivities<
    ReturnType<typeof createActivities>
>({
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

    setHandler(getProgress, (): number => {
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

        await exportConnection({exportId, connectionId});

        connectionIdMapping[connectionId] = `connectionId_${i}`;
        processedEntriesCount++;
    }

    for (let i = 0; i < datasets.length; i++) {
        const datasetId = datasets[i];

        await exportDataset({exportId, datasetId, idMapping: connectionIdMapping});

        processedEntriesCount++;
    }

    await finishExport({exportId});

    return {exportId};
};
