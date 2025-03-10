import {msToTs} from '@temporalio/common/lib/time';

import {getClient} from './client';
import {NAMESPACE} from './constants';

export const initNamespace = async () => {
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
