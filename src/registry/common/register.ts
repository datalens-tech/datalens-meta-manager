import {registry} from '../index';

import {checkExportAvailability} from './utils/check-export-availability';
import {getAdditionalDefaultUsHeaders} from './utils/get-additional-default-us-headers';

export const registerCommonPlugins = () => {
    registry.common.functions.register({
        getAdditionalDefaultUsHeaders,
        checkExportAvailability,
    });
};
