import * as path from 'path';

import {NodeKit} from '@gravity-ui/nodekit';

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

export {nodekit};
