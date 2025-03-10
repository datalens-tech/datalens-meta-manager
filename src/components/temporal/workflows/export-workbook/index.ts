import {proxyActivities, workflowInfo} from '@temporalio/workflow';

import type {createActivities} from './activities';
import type {ExportWorkbookArgs, ExportWorkbookResult} from './types';

export const exportWorkbook = async (
    _params: ExportWorkbookArgs,
): Promise<ExportWorkbookResult> => {
    const {finishExport} = proxyActivities<ReturnType<typeof createActivities>>({
        retry: {
            initialInterval: '1 second',
            maximumInterval: '1 minute',
            backoffCoefficient: 2,
            maximumAttempts: 500,
        },
        startToCloseTimeout: '1 minute',
    });

    const {workflowId} = workflowInfo();

    await finishExport({exportId: workflowId});

    return {exportId: workflowId};
};
