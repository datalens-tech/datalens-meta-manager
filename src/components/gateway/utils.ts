import {Headers as DebugHeaders, GatewayError} from '@gravity-ui/gateway';

export type GatewayApiErrorResponse<T = GatewayError> = {
    error: T;
    debugHeaders?: DebugHeaders;
};

export function isGatewayError<T = GatewayError>(error: any): error is GatewayApiErrorResponse<T> {
    const target = error?.error;
    return Boolean(target) && typeof target === 'object';
}
