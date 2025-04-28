import {registry} from '../index';

import {getAdditionalDefaultUsHeaders} from './utils/get-additional-default-us-headers';

export const registerCommonPlugins = () => {
    registry.common.functions.register({
        getAdditionalDefaultUsHeaders,
    });
};
