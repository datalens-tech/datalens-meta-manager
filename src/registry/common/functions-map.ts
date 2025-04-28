import {makeFunctionTemplate} from '../utils/make-function-template';

import {GetAdditionalDefaultUsHeaders} from './utils/get-additional-default-us-headers';

export const commonFunctionsMap = {
    getAdditionalDefaultUsHeaders: makeFunctionTemplate<GetAdditionalDefaultUsHeaders>(),
} as const;
