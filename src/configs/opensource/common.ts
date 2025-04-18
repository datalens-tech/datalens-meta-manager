import {AppConfig} from '@gravity-ui/nodekit';

import {Feature, FeaturesConfig} from '../../components/features/types';

export const features: FeaturesConfig = {
    [Feature.ReadOnlyMode]: false,
};

export default {
    features,
} as Partial<AppConfig>;
