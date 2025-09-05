import {US_MASTER_TOKEN_HEADER} from '../../../../constants';
import {createAction} from '../utils';

import type {
    ExportWorkbookEntryParams,
    ExportWorkbookEntryResponse,
    GetWorkbooksTransferCapabilitiesResponse,
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
        retries: 2,
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

    getWorkbooksTransferCapabilities: createAction<GetWorkbooksTransferCapabilitiesResponse>({
        method: 'GET',
        path: () => {
            return `/api/internal/v1/workbooks/meta-manager/capabilities`;
        },
        params: (_, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
        }),
        retries: 2,
    }),
};
