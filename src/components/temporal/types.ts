import type {AppContext} from '@gravity-ui/nodekit';

import type {GatewayApi} from '../gateway';

export type ActivitiesDeps = {
    ctx: AppContext;
    gatewayApi: GatewayApi;
};
