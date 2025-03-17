import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeReqParser, z} from '../../../components/zod';
import {startWorkbookImport} from '../../../services/import';
import {startWorkbookImportModel} from '../response-models';

const requestSchema = {
    body: z.object({
        data: z.any(),
        title: z.string(),
        description: z.string().optional(),
        collectionId: z.string().optional(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const startWorkbookImportController: AppRouteHandler = async (req, res) => {
    const {body} = await parseReq(req);

    const result = await startWorkbookImport(
        {ctx: req.ctx},
        {
            data: body.data,
            title: body.title,
            description: body.description,
            collectionId: body.collectionId,
        },
    );

    res.status(200).send(startWorkbookImportModel.format(result));
};

startWorkbookImportController.api = {
    summary: 'Start workbook import',
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
            description: startWorkbookImportModel.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: startWorkbookImportModel.schema,
                },
            },
        },
    },
};
