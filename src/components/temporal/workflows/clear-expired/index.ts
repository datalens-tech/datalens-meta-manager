import {continueAsNew, proxyActivities} from '@temporalio/workflow';

import type {createActivities} from './activities';

const {clearExports, clearImports} = proxyActivities<ReturnType<typeof createActivities>>({
    retry: {
        initialInterval: '1 sec',
        maximumInterval: '20 sec',
        backoffCoefficient: 3,
        maximumAttempts: 5,
    },
    startToCloseTimeout: '20 sec',
});

export const clearExpired = async (): Promise<void> => {
    const {limitReached: exportsLimitReached} = await clearExports();
    const {limitReached: importsLimitReached} = await clearImports();

    if (exportsLimitReached || importsLimitReached) {
        await continueAsNew<typeof clearExpired>();
    }
};
