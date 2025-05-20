import {Client, Connection} from '@temporalio/client';

import {NAMESPACE} from '../constants';
import {getApiKey} from '../utils';

let _client: Client;

const initClient = async () => {
    if (!_client) {
        const connection = await Connection.connect({
            address: process.env.TEMPORAL_ENDPOINT,
            apiKey: getApiKey(),
        });

        _client = new Client({connection, namespace: NAMESPACE});
    }
};

export const getClient = async () => {
    await initClient();

    return _client;
};
