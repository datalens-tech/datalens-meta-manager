import {AppMiddleware, AppRouteDescription, AuthPolicy} from '@gravity-ui/expresskit';
import type {HttpMethod} from '@gravity-ui/expresskit/dist/types';
import type {NodeKit} from '@gravity-ui/nodekit';

import {Feature} from '../components/features';
import healthcheck from '../controllers/healthcheck';
import {homeController} from '../controllers/home';
import {testController} from '../controllers/test';

export type GetRoutesOptions = {
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
};

export type ExtendedAppRouteDescription<F = Feature> = AppRouteDescription & {
    route: `${Uppercase<HttpMethod>} ${string}`;
    features?: F[];
};

type Routes = Record<string, ExtendedAppRouteDescription>;

export const getRoutes = (_nodekit: NodeKit, options: GetRoutesOptions): Routes => {
    const makeRoute = (
        routeDescription: ExtendedAppRouteDescription,
    ): ExtendedAppRouteDescription => ({
        ...options,
        ...routeDescription,
    });

    const routes = {
        home: makeRoute({
            route: 'GET /',
            handler: homeController,
        }),

        ping: {
            route: 'GET /ping',
            handler: healthcheck.ping,
            authPolicy: AuthPolicy.disabled,
        },
        pingDb: {
            route: 'GET /ping-db',
            handler: healthcheck.pingDb,
            authPolicy: AuthPolicy.disabled,
        },
        pingDbPrimary: {
            route: 'GET /ping-db-primary',
            handler: healthcheck.pingDbPrimary,
            authPolicy: AuthPolicy.disabled,
        },
        pool: {
            route: 'GET /pool',
            handler: healthcheck.pool,
            authPolicy: AuthPolicy.disabled,
        },

        test: makeRoute({
            route: 'GET /test',
            handler: testController,
            authPolicy: AuthPolicy.disabled,
        }),
    } satisfies Routes;

    return routes;
};
