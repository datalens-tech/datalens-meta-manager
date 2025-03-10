import type {ActivitiesDeps} from '../../../types';

import {FinishExportArgs, finishExport} from './finish-export';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishExport(args: FinishExportArgs) {
        return finishExport(deps, args);
    },
});
