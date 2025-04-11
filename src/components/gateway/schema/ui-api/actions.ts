import {US_MASTER_TOKEN_HEADER} from '../../../../constants';
import {createAction} from '../utils';

import type {
    ExportWorkbookEntryParams,
    ExportWorkbookEntryResponse,
    ImportWorkbookEntryParams,
    ImportWorkbookEntryResponse,
} from './types';

export const actions = {
    exportWorkbookEntry: createAction<ExportWorkbookEntryResponse, ExportWorkbookEntryParams>({
        method: 'POST',
        path: () => {
            return `/api/internal/v1/workbooks/export`;
        },
        params: ({exportId, idMapping, scope, workbookId}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            body: {
                exportId,
                scope,
                idMapping,
                workbookId,
            },
        }),
    }),

    importWorkbookEntry: createAction<ImportWorkbookEntryResponse, ImportWorkbookEntryParams>({
        method: 'POST',
        path: () => {
            return `/api/internal/v1/workbooks/import`;
        },
        params: ({workbookId, idMapping, entryData}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            body: {
                idMapping,
                workbookId,
                entryData,
            },
        }),
    }),
};
