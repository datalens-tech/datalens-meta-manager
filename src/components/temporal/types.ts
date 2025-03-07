import type {AppContext} from '@gravity-ui/nodekit';

import type {ExportModel, ImportModel} from '../../db/models';
import type {GatewayApi} from '../gateway';

export type ActivitiesDeps = {
    models: {ExportModel: typeof ExportModel; ImportModel: typeof ImportModel};
    ctx: AppContext;
    gatewayApi: GatewayApi;
};
