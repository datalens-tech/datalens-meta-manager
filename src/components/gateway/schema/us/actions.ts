import {US_MASTER_TOKEN_HEADER} from '../../../../constants';
import {createAction} from '../utils';

import {
    CreateWorkbookParams,
    CreateWorkbookResponse,
    GetWorkbookContentParams,
    GetWorkbookContentResponse,
    GetWorkbookParams,
    GetWorkbookResponse,
} from './types';

export const actions = {
    _getWorkbook: createAction<GetWorkbookResponse, GetWorkbookParams>({
        method: 'GET',
        path: ({workbookId}) => {
            return `/private/v2/workbooks/${workbookId}`;
        },
        params: ({includePermissionsInfo}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            query: {
                includePermissionsInfo,
            },
        }),
    }),

    _createWorkbook: createAction<CreateWorkbookResponse, CreateWorkbookParams>({
        method: 'POST',
        path: () => `/private/v2/workbooks`,
        params: ({collectionId, title, description}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            body: {
                collectionId,
                title,
                description,
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
    }),
};
