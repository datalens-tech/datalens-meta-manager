import {AppContext} from '@gravity-ui/nodekit';

import {registry} from '../../registry';

import {initSchedules} from './client/schedules';
import {initWorkers} from './workers';

export const initTemporal = ({ctx}: {ctx: AppContext}) => {
    const {gatewayApi} = registry.getGatewayApi();

    initWorkers({ctx, gatewayApi}).catch((error) => {
        ctx.logError('TEMPORAL_WORKER_FAIL', error);

        process.exit(1);
    });

    initSchedules().catch((error) => {
        ctx.logError('TEMPORAL_INIT_SCHEDULES_FAIL', error);

        process.exit(1);
    });
};
