import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../components/api-docs';
import {makeReqParser, z} from '../../components/zod';
import {exportWorkbook} from '../../services/export';
import {initWorkbookExportModel} from '../response-models';

const requestSchema = {
    body: z.object({
        workbookId: z.string(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const exportWorkbookController: AppRouteHandler = async (req, res) => {
    const {body} = await parseReq(req);

    const result = await exportWorkbook(
        {ctx: req.ctx},
        {
            workbookId: body.workbookId,
        },
    );

    res.status(200).send(initWorkbookExportModel.format(result));
};

exportWorkbookController.api = {
    summary: 'Export workbook',
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
            description: initWorkbookExportModel.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: initWorkbookExportModel.schema,
                },
            },
        },
    },
};
