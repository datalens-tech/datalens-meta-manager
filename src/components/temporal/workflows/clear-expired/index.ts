import {continueAsNew, proxyActivities} from '@temporalio/workflow';

import type {createActivities} from './activities';

const {clearExports, clearImports} = proxyActivities<ReturnType<typeof createActivities>>({
    // TODO: check config values
    retry: {
        initialInterval: '1 sec',
        maximumInterval: '10 sec',
        backoffCoefficient: 2,
        maximumAttempts: 5,
    },
    startToCloseTimeout: '1 minute',
});

export const clearExpired = async (): Promise<void> => {
    const {limitReached: exportsLimitReached} = await clearExports();
    const {limitReached: importsLimitReached} = await clearImports();

    if (exportsLimitReached || importsLimitReached) {
        await continueAsNew<typeof clearExpired>();
    }
};
