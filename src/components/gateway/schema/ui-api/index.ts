import type {BaseSchema} from '@gravity-ui/gateway';

import {US_MASTER_TOKEN_HEADER} from '../../../../constants';

import {actions} from './actions';
import {endpoints} from './endpoints';

export const uiApi = {
    serviceName: 'uiApi',
    actions,
    endpoints,
    getAuthHeaders: ({authArgs}) => ({
        ...(authArgs?.usMasterToken
            ? {[US_MASTER_TOKEN_HEADER]: authArgs.usMasterToken as string}
            : {}),
    }),
} satisfies BaseSchema[string];
