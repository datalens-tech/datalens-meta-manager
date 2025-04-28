import {createFunctionsRegistry} from '../utils/functions-registry';

import {commonFunctionsMap} from './functions-map';

const functionsRegistry = createFunctionsRegistry(commonFunctionsMap);

export const commonRegistry = {
    functions: functionsRegistry,
};
