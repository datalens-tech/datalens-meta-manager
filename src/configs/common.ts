import {AuthPolicy} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';

import {US_MASTER_TOKEN_HEADER} from '../constants';
import {getEnvCert, getRequiredEnvVariable, isTruthyEnvVariable} from '../utils';

const appSensitiveHeaders = [US_MASTER_TOKEN_HEADER];

const isAuthEnabled = isTruthyEnvVariable('AUTH_ENABLED');

const config: Partial<AppConfig> = {
    appName: 'datalens-meta-manager',

    expressBodyParserJSONConfig: {
        limit: '50mb',
    },
    expressBodyParserURLEncodedConfig: {
        limit: '50mb',
        extended: false,
    },

    usMasterToken: getRequiredEnvVariable('US_MASTER_TOKEN'),
    exportDataVerificationKey: getRequiredEnvVariable('EXPORT_DATA_VERIFICATION_KEY'),

    isAuthEnabled,
    appAuthPolicy: isAuthEnabled ? AuthPolicy.required : AuthPolicy.disabled,
    authTokenPublicKey: getEnvCert('AUTH_TOKEN_PUBLIC_KEY'),

    multitenant: false,

    appSensitiveHeaders,

    features: {},

    swaggerEnabled: !isTruthyEnvVariable('DISABLE_SWAGGER'),
};

export default config;
