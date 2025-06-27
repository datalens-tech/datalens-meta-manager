import {BigIntId} from '../../../../types';

export type ExportWorkbookArgs = {
    workbookId: string;
    exportId: BigIntId;
    tenantId?: string;
    requestId: string;
    withExportEntries: boolean;
};

export type ExportWorkbookResult = {
    exportId: BigIntId;
};
