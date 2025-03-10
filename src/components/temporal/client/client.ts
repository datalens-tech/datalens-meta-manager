import {Client, Connection} from '@temporalio/client';
import {msToTs} from '@temporalio/common/lib/time';

import {NAMESPACE} from '../constants';

let _client: Client;

const initClient = async () => {
    if (!_client) {
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

        _client = new Client({connection, namespace: NAMESPACE});
    }
};

export const getClient = async () => {
    await initClient();

    return _client;
};
