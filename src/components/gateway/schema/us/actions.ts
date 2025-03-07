import {US_MASTER_TOKEN_HEADER} from '../../../../constants';
import {createAction} from '../utils';

import {
    CreateWorkbookParams,
    CreateWorkbookResponse,
    GetWorkbookParams,
    GetWorkbookResponse,
} from './types';

export const actions = {
    _getWorkbook: createAction<GetWorkbookResponse, GetWorkbookParams>({
        method: 'GET',
        path: (params) => {
            return `/private/v2/workbooks/${params.workbookId}`;
        },
        params: (_, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
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
};
