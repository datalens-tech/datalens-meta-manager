import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeReqParser, z} from '../../../components/zod';
import {getWorkbookExport} from '../../../services/export';
import {getWorkbookExportModel} from '../response-models';

const requestSchema = {
    params: z.object({
        exportId: z.string(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const getWorkbookExportController: AppRouteHandler = async (req, res) => {
    const {params} = await parseReq(req);

    const result = await getWorkbookExport(
        {ctx: req.ctx},
        {
            exportId: params.exportId,
        },
    );

    res.status(200).send(getWorkbookExportModel.format(result));
};

getWorkbookExportController.api = {
    summary: 'Get workbook export',
    tags: [ApiTag.Workbooks],
    request: {
        params: requestSchema.params,
    },
    responses: {
        200: {
            description: getWorkbookExportModel.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: getWorkbookExportModel.schema,
                },
            },
        },
    },
};
