import type {ActivitiesDeps} from '../../../types';

import {clearExports} from './clear-exports';
import {clearImports} from './clear-imports';

export const createActivities = (_: ActivitiesDeps) => ({
    async clearExports() {
        return clearExports();
    },

    async clearImports() {
        return clearImports();
    },
});
