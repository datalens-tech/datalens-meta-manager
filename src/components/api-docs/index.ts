import {OpenAPIRegistry, OpenApiGeneratorV31} from '@asteasolutions/zod-to-openapi';
import {AppRouteDescription, ExpressKit} from '@gravity-ui/expresskit';
import swaggerUi from 'swagger-ui-express';
import {ZodType} from 'zod';

import type {AppRoutes} from '../../routes';

import type {Method} from './types';
import {formatPath} from './utils';

export {ApiTag, CONTENT_TYPE_JSON} from './constants';

const openApiRegistry = new OpenAPIRegistry();

const registerApiRoute = ({
    route,
    routeDescription,
}: {
    route: string;
    routeDescription: AppRouteDescription;
}) => {
    const {handler} = routeDescription;
    const {api} = handler;

    if (!api) {
        return;
    }

    const [rawMethod, rawPath] = route.split(' ');

    const method = rawMethod.toLowerCase() as Method;
    const path = formatPath(rawPath);

    const headers: ZodType<unknown>[] = [];

    if (api.request?.headers) {
        if (Array.isArray(api.request.headers)) {
            headers.push(...api.request.headers);
        } else {
            headers.push(api.request.headers);
        }
    }

    openApiRegistry.registerPath({
        method,
        path,
        ...api,
        request: {
            ...api.request,
            headers: [...headers],
        },
        responses: api.responses ?? {},
    });
};

export const initSwagger = (app: ExpressKit, routes: AppRoutes) => {
    Object.entries(routes).forEach(([route, routeDescription]) => {
        registerApiRoute({route, routeDescription});
    });

    const {config} = app;

    const installationText = `Installation – <b>${config.appInstallation}</b>`;
    const envText = `Env – <b>${config.appEnv}</b>`;
    const descriptionText = `<br />Service for managing DataLens async workflows.`;

    setImmediate(() => {
        app.express.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(
                new OpenApiGeneratorV31(openApiRegistry.definitions).generateDocument({
                    openapi: '3.1.0',
                    info: {
                        version: `${config.appVersion}`,
                        title: `DataLens Meta Manager Service`,
                        description: [installationText, envText, descriptionText].join('<br />'),
                    },
                    servers: [{url: '/'}],
                }),
            ),
        );
    });
};
