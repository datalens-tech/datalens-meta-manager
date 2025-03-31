import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeReqParser, z, zc} from '../../../components/zod';
import {getWorkbookExport} from '../../../services/export';

import {responseModel} from './response-model';

const requestSchema = {
    params: z.object({
        exportId: zc.decodeId(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const getWorkbookExportResultController: AppRouteHandler = async (req, res) => {
    const {params} = await parseReq(req);

    const result = await getWorkbookExport(
        {ctx: req.ctx},
        {
            exportId: params.exportId,
        },
    );

    res.status(200).send(responseModel.format(result));
};

getWorkbookExportResultController.api = {
    summary: 'Get workbook export result',
    tags: [ApiTag.Workbooks],
    request: {
        params: requestSchema.params,
    },
    responses: {
        200: {
            description: responseModel.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: responseModel.schema,
                },
            },
        },
    },
};
