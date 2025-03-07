import type {ActivitiesDeps} from '../../../types';

import {FinishExportArgs, finishExport} from './finish-export';
import {SaveWorkbookArgs, saveWorkbook} from './save-workbook';

export const createActivities = (deps: ActivitiesDeps) => ({
    async saveWorkbook(args: SaveWorkbookArgs) {
        return saveWorkbook(deps, args);
    },

    async finishExport(args: FinishExportArgs) {
        return finishExport(deps, args);
    },
});
