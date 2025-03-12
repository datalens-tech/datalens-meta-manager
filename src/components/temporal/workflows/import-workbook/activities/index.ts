import type {ActivitiesDeps} from '../../../types';

import {FinishImportArgs, finishImport} from './finish-import';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishImport(args: FinishImportArgs) {
        return finishImport(deps, args);
    },
});
