import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {startImportWorkbookWorkflow} from '../../components/temporal/client';
import {WORKBOOK_IMPORT_EXPIRATION_DAYS} from '../../constants';
import {WorkbookImportModel} from '../../db/models';
import {registry} from '../../registry';
import {ServiceArgs} from '../../types/service';

type StartWorkbookImportArgs = {
    // TODO: fix data type
    data: any;
    title: string;
    description?: string;
    collectionId?: string;
};

export const startWorkbookImport = async (
    {ctx}: ServiceArgs,
    args: StartWorkbookImportArgs,
): Promise<WorkbookImportModel> => {
    const {data, title, description, collectionId} = args;

    ctx.log('START_WORKBOOK_IMPORT_START', {
        title,
        description,
        collectionId,
    });

    const {gatewayApi} = registry.getGatewayApi();

    const {
        responseData: {workbookId},
    } = await gatewayApi.us.createWorkbook({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        // TODO: create workbook in pending status, add importId to workbook meta
        args: {title, description, collectionId},
    });

    const user = ctx.get('user');

    const result = await WorkbookImportModel.query(WorkbookImportModel.replica)
        .insert({
            createdBy: user?.userId ?? '',
            expiredAt: raw(`NOW() + INTERVAL '?? DAY'`, [WORKBOOK_IMPORT_EXPIRATION_DAYS]),
            meta: {workbookId},
            data,
        })
        .timeout(WorkbookImportModel.DEFAULT_QUERY_TIMEOUT);

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
