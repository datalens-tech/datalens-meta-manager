import {makeFunctionTemplate} from '../utils/make-function-template';

import {CheckExportAvailability} from './utils/check-export-availability';
import {GetAdditionalDefaultUsHeaders} from './utils/get-additional-default-us-headers';
import {GetAuthArgsUiApiPrivate} from './utils/get-auth-args-ui-api-private';
import {GetAuthArgsUsPrivate} from './utils/get-auth-args-us-private';

export const commonFunctionsMap = {
    getAdditionalDefaultUsHeaders: makeFunctionTemplate<GetAdditionalDefaultUsHeaders>(),
    checkExportAvailability: makeFunctionTemplate<CheckExportAvailability>(),
    getAuthArgsUsPrivate: makeFunctionTemplate<GetAuthArgsUsPrivate>(),
    getAuthArgsUiApiPrivate: makeFunctionTemplate<GetAuthArgsUiApiPrivate>(),
} as const;
