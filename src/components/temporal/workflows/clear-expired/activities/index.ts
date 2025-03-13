import type {ActivitiesDeps} from '../../../types';

import {clearExports} from './clear-exports';
import {clearImports} from './clear-imports';

export const createActivities = (deps: ActivitiesDeps) => ({
    async clearExports() {
        return clearExports(deps);
    },
    async clearImports() {
        return clearImports(deps);
    },
});
