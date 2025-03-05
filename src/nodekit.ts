import * as path from 'path';

import {NodeKit} from '@gravity-ui/nodekit';

import {initDB} from './db/init-db';
import {registry} from './registry';

const nodekit = new NodeKit({
    configsPath: path.resolve(__dirname, 'configs'),
});

const {appName, appEnv, appInstallation, appDevMode} = nodekit.config;

nodekit.ctx.log('AppConfig details', {
    appName,
    appEnv,
    appInstallation,
    appDevMode,
});

const initedDB = initDB(nodekit);
registry.setupDbInstance(initedDB);

export {nodekit};
