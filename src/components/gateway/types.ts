import type {Request, Response} from '@gravity-ui/expresskit';
import {ApiWithRoot} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';

import type {schema} from './schema';

export type GatewaySchemas = {root: typeof schema};

export type GatewayApi = ApiWithRoot<GatewaySchemas, AppContext, Request, Response>;
