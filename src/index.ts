/* eslint-disable import/order */
import {nodekit} from './nodekit';

import {AppMiddleware, ExpressKit} from '@gravity-ui/expresskit';

import {initSwagger} from './components/api-docs';
import {ctxInfo, finalRequestHandler} from './components/middlewares';
import {initTemporal} from './components/temporal/utils';
import {appAuth} from './components/auth/middlewares/app-auth';
import {registry} from './registry';
import {getAppRoutes} from './routes';

const beforeAuth: AppMiddleware[] = [];
const afterAuth: AppMiddleware[] = [ctxInfo];

const preRunPromises: Promise<unknown>[] = [];

if (nodekit.config.isAuthEnabled) {
    nodekit.config.appAuthHandler = appAuth;
}

nodekit.config.appFinalErrorHandler = finalRequestHandler;

if (require.main === module) {
    preRunPromises.push(initTemporal({ctx: nodekit.ctx}));
}

const routes = getAppRoutes(nodekit, {beforeAuth, afterAuth});

const app = new ExpressKit(nodekit, routes);
registry.setupApp(app);

if (nodekit.config.swaggerEnabled) {
    initSwagger(app, routes);
}

if (require.main === module) {
    Promise.all(preRunPromises).then(() => {
        app.run();
    });
}

export default app;
