import {ImportModel} from '../import';
import type {WorkbookExportData} from '../workbook-export/types';

import type {WorkbookImportErrors, WorkbookImportMeta, WorkbookImportNotifications} from './types';

export class WorkbookImportModel extends ImportModel<
    WorkbookImportMeta,
    WorkbookExportData,
    WorkbookImportNotifications,
    WorkbookImportErrors
> {}
