import {US_MASTER_TOKEN_HEADER} from '../../../../constants';
import {createAction} from '../utils';

import {
    CreateWorkbookParams,
    CreateWorkbookResponse,
    DeleteWorkbookParams,
    DeleteWorkbookResponse,
    GetWorkbookContentParams,
    GetWorkbookContentResponse,
    GetWorkbookParams,
    GetWorkbookResponse,
    UpdateWorkbookParams,
    UpdateWorkbookResponse,
} from './types';

export const actions = {
    getWorkbook: createAction<GetWorkbookResponse, GetWorkbookParams>({
        method: 'GET',
        path: ({workbookId}) => {
            return `/v2/workbooks/${workbookId}`;
        },
        params: ({includePermissionsInfo}, headers) => ({
            headers,
            query: {
                includePermissionsInfo,
            },
        }),
        retries: 2,
    }),

    createWorkbook: createAction<CreateWorkbookResponse, CreateWorkbookParams>({
        method: 'POST',
        path: () => `/v2/workbooks`,
        params: ({collectionId, title, description, status}, headers) => ({
            headers,
            body: {
                collectionId,
                title,
                description,
                status,
            },
        }),
    }),

    _updateWorkbook: createAction<UpdateWorkbookResponse, UpdateWorkbookParams>({
        method: 'POST',
        path: ({workbookId}) => `/private/v2/workbooks/${workbookId}/update`,
        params: ({title, description, status, meta}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            body: {
                title,
                description,
                status,
                meta,
            },
        }),
    }),

    _getWorkbookContent: createAction<GetWorkbookContentResponse, GetWorkbookContentParams>({
        method: 'GET',
        path: ({workbookId}) => `/private/v2/workbooks/${workbookId}/entries`,
        params: ({page}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            query: {
                page,
            },
        }),
        retries: 2,
    }),

    _deleteWorkbook: createAction<DeleteWorkbookResponse, DeleteWorkbookParams>({
        method: 'DELETE',
        path: ({workbookId}) => `/private/v2/workbooks/${workbookId}`,
        params: (params, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
        }),
    }),
};
