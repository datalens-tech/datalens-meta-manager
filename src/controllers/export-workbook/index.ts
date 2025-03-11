import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../components/api-docs';
import {makeReqParser, z} from '../../components/zod';
import {exportWorkbook} from '../../services/export';
import {exportWorkbookModel} from '../response-models';

const requestSchema = {
    params: z.object({
        workbookId: z.string(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const exportWorkbookController: AppRouteHandler = async (req, res) => {
    const {params} = await parseReq(req);

    const result = await exportWorkbook(
        {ctx: req.ctx},
        {
            workbookId: params.workbookId,
        },
    );

    res.status(200).send(exportWorkbookModel.format(result));
};

exportWorkbookController.api = {
    summary: 'Export workbook',
    tags: [ApiTag.Export],
    request: {
        params: requestSchema.params,
    },
    responses: {
        200: {
            description: exportWorkbookModel.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: exportWorkbookModel.schema,
                },
            },
        },
    },
};
