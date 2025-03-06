import type {RouteConfig as ZodOpenApiRouteConfig} from '@asteasolutions/zod-to-openapi';

export interface PlatformAppRouteParams {
    write?: boolean;
}

export interface PlatformAppRouteHandler {
    api?: Omit<ZodOpenApiRouteConfig, 'method' | 'path' | 'responses'> & {
        responses?: ZodOpenApiRouteConfig['responses'];
    };
}
