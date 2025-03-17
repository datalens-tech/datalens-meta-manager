import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {startImportWorkbookWorkflow} from '../../components/temporal/client';
import {ImportModel} from '../../db/models';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';

type StartWorkbookImportArgs = {
    data: Record<string, unknown>;
    title: string;
    description?: string;
    collectionId?: string;
};

export const startWorkbookImport = async (
    {ctx}: ServiceArgs,
    args: StartWorkbookImportArgs,
): Promise<ImportModel> => {
    const {data, title, description, collectionId} = args;

    ctx.log('START_WORKBOOK_IMPORT_START', {
        title,
        description,
        collectionId,
    });

    const {gatewayApi} = registry.getGatewayApi();

    const {
        responseData: {workbookId},
    } = await gatewayApi.us._createWorkbook({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        // TODO: create workbook in pending status, add importId to workbook meta
        args: {title, description, collectionId},
    });

    const result = await ImportModel.query(ImportModel.replica)
        .insert({
            // TODO: fix user id
            createdBy: 'mock-user-id',
            expiredAt: raw(`NOW() + INTERVAL '?? DAY'`, [1]),
            data,
        })
        .timeout(ImportModel.DEFAULT_QUERY_TIMEOUT);

    await startImportWorkbookWorkflow({
        importId: result.importId,
        workbookId,
    });

    ctx.log('START_WORKBOOK_IMPORT_FINISH', {
        importId: result.importId,
        workbookId,
    });

    return result;
};
