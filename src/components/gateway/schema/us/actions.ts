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
    }),

    createWorkbook: createAction<CreateWorkbookResponse, CreateWorkbookParams>({
        method: 'POST',
        path: () => `/v2/workbooks`,
        params: ({collectionId, title, description}, headers) => ({
            headers,
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
