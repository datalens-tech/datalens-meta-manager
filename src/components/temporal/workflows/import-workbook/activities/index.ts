import {WorkbookStatus} from '../../../../gateway/schema/us/types/workbook';
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
import {UpdateWorkbookStatusArgs, updateWorkbookStatus} from './update-workbook-status';

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

    async updateWorkbookStatusActive(args: Omit<UpdateWorkbookStatusArgs, 'status'>) {
        return updateWorkbookStatus(deps, {...args, status: WorkbookStatus.Active});
    },

    async updateWorkbookStatusDeleting(args: Omit<UpdateWorkbookStatusArgs, 'status'>) {
        return updateWorkbookStatus(deps, {...args, status: WorkbookStatus.Deleting});
    },
});
