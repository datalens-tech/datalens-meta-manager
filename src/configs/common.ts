import {AppConfig} from '@gravity-ui/nodekit';

import {getEnvCert, getRequiredEnvVariable, isTruthyEnvVariable} from '../utils';

const config: Partial<AppConfig> = {
    appName: 'datalens-transfer',
    swaggerEnabled: true,
    usMasterToken: getRequiredEnvVariable('US_MASTER_TOKEN'),
    exportDataVerificationKey: getRequiredEnvVariable('EXPORT_DATA_VERIFICATION_KEY'),
    isAuthEnabled: isTruthyEnvVariable('AUTH_ENABLED'),
    authTokenPublicKey: getEnvCert('AUTH_TOKEN_PUBLIC_KEY'),
};

export default config;
