import {makeFunctionTemplate} from '../utils/make-function-template';

import {CheckExportAvailability} from './utils/check-export-availability';
import {GetAdditionalDefaultUsHeaders} from './utils/get-additional-default-us-headers';

export const commonFunctionsMap = {
    getAdditionalDefaultUsHeaders: makeFunctionTemplate<GetAdditionalDefaultUsHeaders>(),
    checkExportAvailability: makeFunctionTemplate<CheckExportAvailability>(),
} as const;
