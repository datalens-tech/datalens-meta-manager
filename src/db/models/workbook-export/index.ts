import {ExportModel} from '../export';

import type {
    WorkbookExportData,
    WorkbookExportErrors,
    WorkbookExportMeta,
    WorkbookExportNotifications,
} from './types';

export class WorkbookExportModel extends ExportModel<
    WorkbookExportMeta,
    WorkbookExportData,
    WorkbookExportErrors,
    WorkbookExportNotifications
> {}
