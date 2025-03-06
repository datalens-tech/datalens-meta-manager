import {FeaturesConfig} from '../components/features/types';
import type {Registry} from '../registry';

export interface PlatformAppConfig {
    features: FeaturesConfig;
    usMasterToken: string;
    swaggerEnabled?: boolean;
}

export interface PlatformAppContextParams {
    registry: Registry;
}

export interface PlatformAppDynamicConfig {
    features?: FeaturesConfig;
}
