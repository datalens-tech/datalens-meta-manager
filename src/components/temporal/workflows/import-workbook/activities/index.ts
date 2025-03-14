import type {ActivitiesDeps} from '../../../types';

import {FinishImportArgs, finishImport} from './finish-import';
import {
    GetImportDataEntriesInfoArgs,
    getImportDataEntriesInfo,
} from './get-import-data-entries-info';
import {ImportConnectionArgs, importConnection} from './import-connection';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishImport(args: FinishImportArgs) {
        return finishImport(deps, args);
    },

    async getImportDataEntriesInfo(args: GetImportDataEntriesInfoArgs) {
        return getImportDataEntriesInfo(deps, args);
    },

    async importConnection(args: ImportConnectionArgs) {
        return importConnection(deps, args);
    },
});
