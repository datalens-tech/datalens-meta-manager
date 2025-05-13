import {BigIntId} from '../../../../types';

export type ImportWorkbookArgs = {
    workbookId: string;
    importId: BigIntId;
    tenantId?: string;
    requestId: string;
};

export type ImportWorkbookResult = {
    importId: BigIntId;
};
