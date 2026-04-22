import type {CtxSubject} from '../components/auth/types/subject';
import {FeaturesConfig} from '../components/features/types';
import type {Registry} from '../registry';

import {CtxInfo} from './ctx';

export interface PlatformAppConfig {
    features: FeaturesConfig;
    dynamicFeaturesEndpoint?: string;

    usMasterToken: string;
    swaggerEnabled?: boolean;
    exportDataVerificationKey: string;
    multitenant: boolean;
    tenantIdOverride?: string;

    // auth
    isAuthEnabled?: boolean;
    authTokenPublicKey?: string;
}

export interface PlatformAppContextParams {
    info: CtxInfo;
    registry: Registry;

    // auth
    subject?: CtxSubject;
}

export interface PlatformAppDynamicConfig {
    features?: FeaturesConfig;
}
