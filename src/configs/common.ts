import {AuthPolicy} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';

import {getEnvCert, getRequiredEnvVariable, isTruthyEnvVariable} from '../utils';

const isAuthEnabled = isTruthyEnvVariable('AUTH_ENABLED');

const config: Partial<AppConfig> = {
    appName: 'datalens-transfer',
    swaggerEnabled: true,
    usMasterToken: getRequiredEnvVariable('US_MASTER_TOKEN'),
    exportDataVerificationKey: getRequiredEnvVariable('EXPORT_DATA_VERIFICATION_KEY'),
    isAuthEnabled,
    appAuthPolicy: isAuthEnabled ? AuthPolicy.required : AuthPolicy.disabled,
    authTokenPublicKey: getEnvCert('AUTH_TOKEN_PUBLIC_KEY'),
};

export default config;
