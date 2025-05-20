import {Client, Connection} from '@temporalio/client';
import jwt from 'jsonwebtoken';

import {isTruthyEnvVariable} from '../../../utils';
import {NAMESPACE} from '../constants';

let _client: Client;

const initClient = async () => {
    if (!_client) {
        let apiKey: string | undefined;
        if (isTruthyEnvVariable('TEMPORAL_AUTH_ENABLED') && process.env.TEMPORAL_AUTH_PRIVATE_KEY) {
            apiKey = jwt.sign(
                {
                    sub: process.env.TEMPORAL_AUTH_SERVICE || 'temporal',
                    permissions: `["${NAMESPACE}:admin"]`,
                },
                process.env.TEMPORAL_AUTH_PRIVATE_KEY,
                {
                    algorithm: 'RS256',
                    keyid: process.env.TEMPORAL_AUTH_SERVICE || 'temporal',
                },
            );
        }
        const connection = await Connection.connect({
            address: process.env.TEMPORAL_ENDPOINT,
            apiKey,
        });

        _client = new Client({connection, namespace: NAMESPACE});
    }
};

export const getClient = async () => {
    await initClient();

    return _client;
};
