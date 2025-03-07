import {Connection, WorkflowClient} from '@temporalio/client';
import {msToTs} from '@temporalio/common/lib/time';

import {NAMESPACE} from '../constants';

let client: WorkflowClient;

const initClient = async () => {
    if (!client) {
        const connection = await Connection.connect();

        const {namespaces} = await connection.workflowService.listNamespaces({});
        const namespaceInited = namespaces.some(
            ({namespaceInfo}) => namespaceInfo?.name === NAMESPACE,
        );

        if (!namespaceInited) {
            await connection.workflowService.registerNamespace({
                namespace: NAMESPACE,
                workflowExecutionRetentionPeriod: msToTs('1 day'),
            });
        }

        client = new WorkflowClient({connection, namespace: NAMESPACE});
    }
};

export const getClient = async () => {
    await initClient();

    return client;
};
