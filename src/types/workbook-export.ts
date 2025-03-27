import {WorkbookExportData} from '../db/models/workbook-export/types';

export type WorkbookExportDataWithHash = {export: WorkbookExportData; hash: string};
