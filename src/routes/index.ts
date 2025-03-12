import {AppMiddleware, AppRouteDescription, AuthPolicy} from '@gravity-ui/expresskit';
import type {HttpMethod} from '@gravity-ui/expresskit/dist/types';
import type {NodeKit} from '@gravity-ui/nodekit';

import {Feature, isEnabledFeature} from '../components/features';
import healthcheck from '../controllers/healthcheck';
import {homeController} from '../controllers/home';
import {
    getWorkbookExportController,
    getWorkbookExportStatusController,
    startWorkbookExportController,
} from '../controllers/workbook-export';
import {
    getWorkbookImportStatusController,
    startWorkbookImportController,
} from '../controllers/workbook-import';
import {objectKeys} from '../utils';

type GetRoutesOptions = {
    beforeAuth: AppMiddleware[];
    afterAuth: AppMiddleware[];
};

type Route = `${Uppercase<HttpMethod>} ${string}`;

export type AppRoutes = Record<Route, AppRouteDescription>;

export type ExtendedAppRouteDescription<F = Feature> = AppRouteDescription & {
    route: Route;
    features?: F[];
};

export const getRoutes = (nodekit: NodeKit, options: GetRoutesOptions) => {
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

        startWorkbookExport: makeRoute({
            route: 'POST /workbooks/export',
            handler: startWorkbookExportController,
        }),
        getWorkbookExport: makeRoute({
            route: 'GET /workbooks/export/:exportId',
            handler: getWorkbookExportController,
        }),
        getWorkbookExportStatus: makeRoute({
            route: 'GET /workbooks/export/:exportId/status',
            handler: getWorkbookExportStatusController,
        }),

        startWorkbookImport: makeRoute({
            route: 'POST /workbooks/import',
            handler: startWorkbookImportController,
        }),
        getWorkbookImportStatus: makeRoute({
            route: 'GET /workbooks/import/:importId/status',
            handler: getWorkbookImportStatusController,
        }),
    } satisfies Record<string, ExtendedAppRouteDescription>;

    const typedRoutes: {[key in keyof typeof routes]: ExtendedAppRouteDescription} = routes;

    return typedRoutes;
};

export const getAppRoutes = (nodekit: NodeKit, options: GetRoutesOptions): AppRoutes => {
    const extendedRoutes = getRoutes(nodekit, options);

    const routes: AppRoutes = {};

    objectKeys(extendedRoutes).forEach((key) => {
        const {route, features, ...params} = extendedRoutes[key];

        const isRouteEnabled =
            !features || features.every((feature) => isEnabledFeature(nodekit.ctx, feature));

        if (isRouteEnabled) {
            routes[route] = params;
        }
    });

    return routes;
};
