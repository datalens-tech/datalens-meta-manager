import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeReqParser, z} from '../../../components/zod';
import {startWorkbookExport} from '../../../services/export';

import {responseModel} from './response-model';

const requestSchema = {
    body: z.object({
        workbookId: z.string(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const startWorkbookExportController: AppRouteHandler = async (req, res) => {
    const {body} = await parseReq(req);

    const result = await startWorkbookExport(
        {ctx: req.ctx},
        {
            workbookId: body.workbookId,
        },
    );

    res.status(200).send(responseModel.format(result));
};

startWorkbookExportController.api = {
    summary: 'Start workbook export',
    tags: [ApiTag.Workbooks],
    request: {
        body: {
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: requestSchema.body,
                },
            },
        },
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
