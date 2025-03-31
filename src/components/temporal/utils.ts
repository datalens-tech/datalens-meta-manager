import {AppContext} from '@gravity-ui/nodekit';
import {msToTs} from '@temporalio/common/lib/time';

import {registry} from '../../registry';

import {getClient} from './client';
import {initSchedules} from './client/schedules';
import {NAMESPACE} from './constants';
import {initWorkers} from './workers';

const initNamespace = async () => {
    const client = await getClient();

    const {namespaces} = await client.workflowService.listNamespaces({});
    const namespaceInited = namespaces.some(({namespaceInfo}) => namespaceInfo?.name === NAMESPACE);

    if (!namespaceInited) {
        await client.workflowService.registerNamespace({
            namespace: NAMESPACE,
            workflowExecutionRetentionPeriod: msToTs('1 day'),
        });
    }
};

export const initTemporal = async ({ctx}: {ctx: AppContext}) => {
    await initNamespace();

    const {gatewayApi} = registry.getGatewayApi();

    initWorkers({ctx, gatewayApi}).catch((error) => {
        ctx.logError('TEMPORAL_WORKER_FAIL', error);
        // TODO: Graceful shutdown
        process.exit(1);
    });

    initSchedules().catch((error) => {
        ctx.logError('TEMPORAL_INIT_SCHEDULES_FAIL', error);
        // TODO: Graceful shutdown
        process.exit(1);
    });
};
