import type {ActivitiesDeps} from '../../../types';

import {ExportConnectionArgs, exportConnection} from './export-connection';
import {ExportDatasetArgs, exportDataset} from './export-dataset';
import {FinishExportArgs, finishExport} from './finish-export';
import {GetWorkbookContentArgs, getWorkbookContent} from './get-workbook-content';

export const createActivities = (deps: ActivitiesDeps) => ({
    async finishExport(args: FinishExportArgs) {
        return finishExport(deps, args);
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
