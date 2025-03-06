import {AppMiddleware, AppRoutes, ExpressKit} from '@gravity-ui/expresskit';
import dotenv from 'dotenv';

dotenv.config();

import {initSwagger, registerApiRoute} from './components/api-docs';
import {isEnabledFeature} from './components/features';
import {finalRequestHandler} from './components/middlewares';
import {nodekit} from './nodekit';
import {registry} from './registry';
import {getRoutes} from './routes';
import {objectKeys} from './utils';

const beforeAuth: AppMiddleware[] = [];
const afterAuth: AppMiddleware[] = [];

nodekit.config.appFinalErrorHandler = finalRequestHandler;

const extendedRoutes = getRoutes(nodekit, {beforeAuth, afterAuth});

const routes: AppRoutes = {};
objectKeys(extendedRoutes).forEach((key) => {
    const {route, features, ...params} = extendedRoutes[key];
    if (
        !Array.isArray(features) ||
        features.every((feature) => isEnabledFeature(nodekit.ctx, feature))
    ) {
        if (nodekit.config.swaggerEnabled) {
            registerApiRoute(extendedRoutes[key]);
        }

        routes[route] = params;
    }
});

const app = new ExpressKit(nodekit, routes);
registry.setupApp(app);

if (nodekit.config.swaggerEnabled) {
    initSwagger(app);
}

if (require.main === module) {
    app.run();
}

export default app;
