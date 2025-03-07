import {AppRouteHandler} from '@gravity-ui/expresskit';
import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ApiTag} from '../../components/api-docs';
import {startExportWorkbook} from '../../components/temporal/client';
import {makeReqParser, z} from '../../components/zod';
import {ExportModel} from '../../db/models';
import {registry} from '../../registry';

const requestSchema = {
    params: z.object({
        workbookId: z.string(),
    }),
};

export type CreateCollectionReqParams = z.infer<typeof requestSchema.params>;

const parseReq = makeReqParser(requestSchema);

export const exportWorkbookController: AppRouteHandler = async (req, res) => {
    const {params} = await parseReq(req);

    const {gatewayApi} = registry.getGatewayApi();

    const {responseData} = await gatewayApi.us._getWorkbook({
        ctx: req.ctx,
        headers: {},
        authArgs: {},
        requestId: req.ctx.get('requestId') ?? uuidv4(),
        args: {workbookId: params.workbookId},
    });

    const result = await ExportModel.query(ExportModel.replica)
        .insert({
            createdBy: 'mock-user-id',
            expiredAt: raw(`NOW() + INTERVAL '?? DAY'`, [1]),
            data: {workbookId: responseData.workbookId},
        })
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    await startExportWorkbook({
        exportId: result.exportId,
        workbookId: params.workbookId,
    });

    res.status(200).send({exportId: result.exportId});
};

exportWorkbookController.api = {
    summary: 'Export workbook',
    tags: [ApiTag.Test],
    request: {
        params: requestSchema.params,
    },
    responses: {},
};
