import {Client, Connection} from '@temporalio/client';
import jwt from 'jsonwebtoken';

import {getEnvCert, isTruthyEnvVariable} from '../../../utils';
import {NAMESPACE} from '../constants';

let _client: Client;

const initClient = async () => {
    if (!_client) {
        let apiKey: string | undefined;

        if (isTruthyEnvVariable('TEMPORAL_AUTH_ENABLED') && process.env.TEMPORAL_AUTH_PRIVATE_KEY) {
            const authPrivateKey = getEnvCert('TEMPORAL_AUTH_PRIVATE_KEY') || '';
            apiKey = jwt.sign(
                {
                    sub: process.env.TEMPORAL_AUTH_SERVICE || 'temporal',
                    permissions: `["${NAMESPACE}:admin"]`,
                },
                authPrivateKey,
                {
                    algorithm: 'RS256',
                    // PS256 not supported by default at temporal
                    // https://github.com/temporalio/temporal/blob/main/common/authorization/default_token_key_provider.go#L63
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
