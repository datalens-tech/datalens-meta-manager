import {registry} from '../index';

import {checkExportAvailability} from './utils/check-export-availability';
import {getAdditionalDefaultUsHeaders} from './utils/get-additional-default-us-headers';
import {getAuthArgsUiApiPrivate} from './utils/get-auth-args-ui-api-private';
import {getAuthArgsUsPrivate} from './utils/get-auth-args-us-private';

export const registerCommonPlugins = () => {
    registry.common.functions.register({
        getAdditionalDefaultUsHeaders,
        checkExportAvailability,
        getAuthArgsUsPrivate,
        getAuthArgsUiApiPrivate,
    });
};
