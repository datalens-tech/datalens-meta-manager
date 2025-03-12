import {defineQuery, proxyActivities, setHandler} from '@temporalio/workflow';

import type {createActivities} from './activities';
import type {ImportWorkbookArgs, ImportWorkbookResult} from './types';

export const getWorkbookImportProgress = defineQuery<number, []>('getProgress');

export const importWorkbook = async ({
    importId,
}: ImportWorkbookArgs): Promise<ImportWorkbookResult> => {
    const {finishImport} = proxyActivities<ReturnType<typeof createActivities>>({
        // TODO: check config values
        retry: {
            initialInterval: '1 sec',
            maximumInterval: '4 sec',
            backoffCoefficient: 2,
            maximumAttempts: 1,
        },
        startToCloseTimeout: '1 min',
    });

    const total = 0;
    const current = 0;

    setHandler(getWorkbookImportProgress, (): number => {
        return total > 0 ? Math.floor((current * 100) / total) : 0;
    });

    await finishImport({importId});

    return {importId};
};
