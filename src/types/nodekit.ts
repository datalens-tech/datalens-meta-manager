import type {CtxUser} from '../components/auth/types/user';
import {FeaturesConfig} from '../components/features/types';
import type {Registry} from '../registry';

export interface PlatformAppConfig {
    features: FeaturesConfig;
    usMasterToken: string;
    swaggerEnabled?: boolean;

    // auth
    isAuthEnabled?: boolean;
    authTokenPublicKey?: string;
}

export interface PlatformAppContextParams {
    registry: Registry;
    // auth
    user?: CtxUser;
}

export interface PlatformAppDynamicConfig {
    features?: FeaturesConfig;
}
