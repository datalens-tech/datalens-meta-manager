import {BigIntId} from '../../../../types';

export type ExportWorkbookArgs = {
    workbookId: string;
    exportId: BigIntId;
    tenantId?: string;
    requestId: string;
};

export type ExportWorkbookResult = {
    exportId: BigIntId;
};
