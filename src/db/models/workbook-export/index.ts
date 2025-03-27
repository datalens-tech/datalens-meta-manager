import {ExportModel} from '../export';

import type {WorkbookExportData, WorkbookExportMeta, WorkbookExportNotifications} from './types';

export class WorkbookExportModel extends ExportModel<
    WorkbookExportMeta,
    WorkbookExportData,
    WorkbookExportNotifications
> {}
