import {AppConfig} from '@gravity-ui/nodekit';

import {getEnvCert, isTruthyEnvVariable} from '../utils';

const config: Partial<AppConfig> = {
    appName: 'datalens-transfer',
    swaggerEnabled: true,
    usMasterToken: process.env.US_MASTER_TOKEN,
    isAuthEnabled: isTruthyEnvVariable('AUTH_ENABLED'),
    authTokenPublicKey: getEnvCert('AUTH_TOKEN_PUBLIC_KEY'),
};

export default config;
