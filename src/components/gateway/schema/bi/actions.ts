import {US_MASTER_TOKEN_HEADER} from '../../../../constants';
import {createAction} from '../utils';

import type {
    ExportConnectionParams,
    ExportConnectionResponse,
    ExportDatasetParams,
    ExportDatasetResponse,
    ImportConnectionParams,
    ImportConnectionResponse,
    ImportDatasetParams,
    ImportDatasetResponse,
} from './types';

export const actions = {
    exportConnection: createAction<ExportConnectionResponse, ExportConnectionParams>({
        method: 'GET',
        path: ({connectionId}) => {
            return `/api/v1/connections/export/${connectionId}`;
        },
        params: (_, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
        }),
    }),

    importConnection: createAction<ImportConnectionResponse, ImportConnectionParams>({
        method: 'POST',
        path: () => {
            return '/api/v1/connections/import';
        },
        params: ({data}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            body: {
                data: {
                    workbook_id: data.workbookId,
                    connection: data.connection,
                },
            },
        }),
    }),

    exportDataset: createAction<ExportDatasetResponse, ExportDatasetParams>({
        method: 'POST',
        path: ({datasetId}) => {
            return `/api/v1/datasets/export/${datasetId}`;
        },
        params: ({idMapping}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            body: {
                id_mapping: idMapping,
            },
        }),
    }),

    importDataset: createAction<ImportDatasetResponse, ImportDatasetParams>({
        method: 'POST',
        path: () => {
            return '/api/v1/datasets/import';
        },
        params: ({data, idMapping}, headers, {ctx}) => ({
            headers: {
                ...headers,
                [US_MASTER_TOKEN_HEADER]: ctx.config.usMasterToken,
            },
            body: {
                data: {
                    workbook_id: data.workbookId,
                    dataset: data.dataset,
                },
                id_mapping: idMapping,
            },
        }),
    }),
};
