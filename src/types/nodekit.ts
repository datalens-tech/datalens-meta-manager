import type {CtxUser} from '../components/auth/types/user';
import {FeaturesConfig} from '../components/features/types';
import type {Registry} from '../registry';

import {CtxInfo} from './ctx';

export interface PlatformAppConfig {
    features: FeaturesConfig;
    usMasterToken: string;
    swaggerEnabled?: boolean;
    exportDataVerificationKey: string;
    multitenant: boolean;

    // auth
    isAuthEnabled?: boolean;
    authTokenPublicKey?: string;
}

export interface PlatformAppContextParams {
    info: CtxInfo;
    registry: Registry;

    // auth
    user?: CtxUser;
}

export interface PlatformAppDynamicConfig {
    features?: FeaturesConfig;
}
