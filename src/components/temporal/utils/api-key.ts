import jwt from 'jsonwebtoken';

import {getEnvCert, getEnvVariable, isTruthyEnvVariable} from '../../../utils';
import {NAMESPACE} from '../constants';

export const getApiKey = (): string | undefined => {
    const authPrivateKey = getEnvCert('TEMPORAL_AUTH_PRIVATE_KEY');
    const authSubject =
        getEnvVariable('TEMPORAL_AUTH_SUBJECT') || getEnvVariable('HOSTNAME') || NAMESPACE;

    if (!isTruthyEnvVariable('TEMPORAL_AUTH_ENABLED') || !authPrivateKey) {
        return undefined;
    }

    return jwt.sign(
        {
            sub: authSubject,
            permissions: [`${NAMESPACE}:admin`],
            // fix time sync between temporal and meta-manager in cluster
            // 30 seconds back
            iat: Math.floor((Date.now() - 30000) / 1000),
        },
        authPrivateKey,
        {
            algorithm: 'RS256',
            // PS256 not supported by default at temporal
            // https://github.com/temporalio/temporal/blob/main/common/authorization/default_token_key_provider.go#L63
            keyid: process.env.TEMPORAL_AUTH_SERVICE || 'temporal',
        },
    );
};
