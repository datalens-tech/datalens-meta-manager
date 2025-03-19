import type {ActivitiesDeps} from '../../../types';

import {DeleteWorkbookArgs, deleteWorkbook} from './delete-workbook';
import {FinishImportErrorArgs, finishImportError} from './finish-import-error';
import {FinishImportSuccessArgs, finishImportSuccess} from './finish-import-success';
import {
    GetImportDataEntriesInfoArgs,
    getImportDataEntriesInfo,
} from './get-import-data-entries-info';
import {ImportConnectionArgs, importConnection} from './import-connection';
import {ImportDatasetArgs, importDataset} from './import-dataset';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishImportSuccess(args: FinishImportSuccessArgs) {
        return finishImportSuccess(deps, args);
    },

    async finishImportError(args: FinishImportErrorArgs) {
        return finishImportError(deps, args);
    },

    async getImportDataEntriesInfo(args: GetImportDataEntriesInfoArgs) {
        return getImportDataEntriesInfo(deps, args);
    },

    async importConnection(args: ImportConnectionArgs) {
        return importConnection(deps, args);
    },

    async importDataset(args: ImportDatasetArgs) {
        return importDataset(deps, args);
    },

    async deleteWorkbook(args: DeleteWorkbookArgs) {
        return deleteWorkbook(deps, args);
    },
});
