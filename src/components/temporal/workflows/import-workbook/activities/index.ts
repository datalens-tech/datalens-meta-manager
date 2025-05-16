import {WorkbookStatus} from '../../../../gateway/schema/us/types/workbook';
import type {ActivitiesDeps} from '../../../types';
import {callActivity} from '../../utils';

import {CheckScopesAvailabilityArgs, checkScopesAvailability} from './check-scopes-availability';
import {DeleteWorkbookArgs, deleteWorkbook} from './delete-workbook';
import {FinishImportErrorArgs, finishImportError} from './finish-import-error';
import {FinishImportSuccessArgs, finishImportSuccess} from './finish-import-success';
import {GetImportCapabilitiesArgs, getImportCapabilities} from './get-import-capabilities';
import {
    GetImportDataEntriesInfoArgs,
    getImportDataEntriesInfo,
} from './get-import-data-entries-info';
import {ImportEntryArgs, importEntry} from './import-entry';
import {UpdateWorkbookStatusArgs, updateWorkbookStatus} from './update-workbook-status';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishImportSuccess(args: FinishImportSuccessArgs) {
        return callActivity({deps, args, activityFn: finishImportSuccess});
    },

    async finishImportError(args: FinishImportErrorArgs) {
        return callActivity({deps, args, activityFn: finishImportError});
    },

    async getImportDataEntriesInfo(args: GetImportDataEntriesInfoArgs) {
        return callActivity({deps, args, activityFn: getImportDataEntriesInfo});
    },

    async importEntry(args: ImportEntryArgs) {
        return callActivity({deps, args, activityFn: importEntry});
    },

    async deleteWorkbook(args: DeleteWorkbookArgs) {
        return callActivity({deps, args, activityFn: deleteWorkbook});
    },

    async updateWorkbookStatusActive(args: Omit<UpdateWorkbookStatusArgs, 'status'>) {
        return callActivity({
            deps,
            args: {...args, status: WorkbookStatus.Active},
            activityFn: updateWorkbookStatus,
        });
    },

    async updateWorkbookStatusDeleting(args: Omit<UpdateWorkbookStatusArgs, 'status'>) {
        return callActivity({
            deps,
            args: {...args, status: WorkbookStatus.Deleting},
            activityFn: updateWorkbookStatus,
        });
    },

    async getImportCapabilities(args: GetImportCapabilitiesArgs) {
        return callActivity({deps, args, activityFn: getImportCapabilities});
    },

    async checkScopesAvailability(args: CheckScopesAvailabilityArgs) {
        return callActivity({deps, args, activityFn: checkScopesAvailability});
    },
});
