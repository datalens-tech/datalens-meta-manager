import {AppConfig} from '@gravity-ui/nodekit';

const config: Partial<AppConfig> = {
    appName: 'datalens-transfer',
    swaggerEnabled: true,
    usMasterToken: process.env.US_MASTER_TOKEN as string,
};

export default config;
