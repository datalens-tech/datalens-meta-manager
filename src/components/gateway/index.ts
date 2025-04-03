import {Request, Response} from '@gravity-ui/expresskit';
import {GatewayConfig, GatewayError} from '@gravity-ui/gateway';
import {AppContext, AppError, NodeKit} from '@gravity-ui/nodekit';

import {AUTHORIZATION_HEADER, TENANT_ID_HEADER} from '../../constants';

export type {GatewaySchemas, GatewayApi} from './types';

export const getGatewayConfig = (
    nodekit: NodeKit,
): GatewayConfig<AppContext, Request, Response> => {
    return {
        installation: nodekit.config.appInstallation || 'unknownAppInstallation',
        env: nodekit.config.appEnv || 'unknownEnv',
        axiosConfig: {},
        caCertificatePath: null,
        withDebugHeaders: false,
        ErrorConstructor: AppError,
        proxyHeaders: [AUTHORIZATION_HEADER, TENANT_ID_HEADER],
        getAuthArgs: () => undefined,
        getAuthHeaders: () => undefined,
    };
};

export type {GatewayError};
export {isGatewayError} from './utils';
