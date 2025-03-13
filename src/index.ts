// eslint-disable-next-line import/order
import {nodekit} from './nodekit';

import {AppMiddleware, ExpressKit} from '@gravity-ui/expresskit';

import {initSwagger} from './components/api-docs';
import {finalRequestHandler} from './components/middlewares';
import {initNamespace as initTemporalNamespace} from './components/temporal/utils';
import {initWorkers as initTemporalWorkers} from './components/temporal/workers';
import {ExportModel, ImportModel} from './db/models';
import {registry} from './registry';
import {getAppRoutes} from './routes';

const beforeAuth: AppMiddleware[] = [];
const afterAuth: AppMiddleware[] = [];

nodekit.config.appFinalErrorHandler = finalRequestHandler;

const {gatewayApi} = registry.getGatewayApi();

if (require.main === module) {
    initTemporalNamespace()
        .then(() =>
            initTemporalWorkers({models: {ExportModel, ImportModel}, ctx: nodekit.ctx, gatewayApi}),
        )
        .catch((error: unknown) => {
            nodekit.ctx.logError('TEMPORAL_INIT_FAIL', error);
            process.exit(1);
        });
}

const routes = getAppRoutes(nodekit, {beforeAuth, afterAuth});

const app = new ExpressKit(nodekit, routes);
registry.setupApp(app);

if (nodekit.config.swaggerEnabled) {
    initSwagger(app, routes);
}

if (require.main === module) {
    app.run();
}

export default app;
