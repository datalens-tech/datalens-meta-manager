import jwt from 'jsonwebtoken';

import {getEnvCert, isTruthyEnvVariable} from '../../../utils';
import {NAMESPACE} from '../constants';

export const getApiKey = (): string | undefined => {
    if (!isTruthyEnvVariable('TEMPORAL_AUTH_ENABLED') || !process.env.TEMPORAL_AUTH_PRIVATE_KEY) {
        return undefined;
    }

    const authPrivateKey = getEnvCert('TEMPORAL_AUTH_PRIVATE_KEY') || '';
    return jwt.sign(
        {
            sub: NAMESPACE,
            permissions: [`${NAMESPACE}:admin`],
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
