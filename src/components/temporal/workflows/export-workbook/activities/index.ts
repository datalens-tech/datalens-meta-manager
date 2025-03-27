import type {ActivitiesDeps} from '../../../types';

import {ExportConnectionArgs, exportConnection} from './export-connection';
import {ExportDatasetArgs, exportDataset} from './export-dataset';
import {FinishExportErrorArgs, finishExportError} from './finish-export-error';
import {FinishExportSuccessArgs, finishExportSuccess} from './finish-export-success';
import {GetWorkbookContentArgs, getWorkbookContent} from './get-workbook-content';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishExportSuccess(args: FinishExportSuccessArgs) {
        return finishExportSuccess(deps, args);
    },

    async finishExportError(args: FinishExportErrorArgs) {
        return finishExportError(deps, args);
    },

    async getWorkbookContent(args: GetWorkbookContentArgs) {
        return getWorkbookContent(deps, args);
    },

    async exportConnection(args: ExportConnectionArgs) {
        return exportConnection(deps, args);
    },

    async exportDataset(args: ExportDatasetArgs) {
        return exportDataset(deps, args);
    },
});
