import type {ActivitiesDeps} from '../../../types';
import {callActivity} from '../../utils';

import {ExportEntryArgs, exportEntry} from './export-entry';
import {FinishExportErrorArgs, finishExportError} from './finish-export-error';
import {FinishExportSuccessArgs, finishExportSuccess} from './finish-export-success';
import {GetWorkbookContentArgs, getWorkbookContent} from './get-workbook-content';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishExportSuccess(args: FinishExportSuccessArgs) {
        return callActivity({deps, args, activityFn: finishExportSuccess});
    },

    async finishExportError(args: FinishExportErrorArgs) {
        return callActivity({deps, args, activityFn: finishExportError});
    },

    async getWorkbookContent(args: GetWorkbookContentArgs) {
        return callActivity({deps, args, activityFn: getWorkbookContent});
    },

    async exportEntry(args: ExportEntryArgs) {
        return callActivity({deps, args, activityFn: exportEntry});
    },
});
