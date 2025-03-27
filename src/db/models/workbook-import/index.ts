import {ImportModel} from '../import';
import type {WorkbookExportData} from '../workbook-export/types';

import type {WorkbookImportMeta, WorkbookImportNotifications} from './types';

export class WorkbookImportModel extends ImportModel<
    WorkbookImportMeta,
    WorkbookExportData,
    WorkbookImportNotifications
> {}
