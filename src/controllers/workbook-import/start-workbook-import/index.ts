import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeParserSync, makeReqParser, z} from '../../../components/zod';
import {workbookExportDataWithHashSchema} from '../../../components/zod/schemas/workbook-transfer';
import {startWorkbookImport} from '../../../services/import';

import {responseModel} from './response-model';

const requestSchema = {
    body: z.object({
        title: z.string(),
        description: z.string().optional(),
        collectionId: z.string().optional().nullable(),
    }),
};

const parseReq = makeReqParser(requestSchema);

const parseData = makeParserSync(workbookExportDataWithHashSchema);

export const startWorkbookImportController: AppRouteHandler = async (req, res) => {
    const {body} = await parseReq(req);

    /**
     * Zod performs a deep clone of the object.
     * However, we need to keep the original object to properly
     * verify its hash in the startWorkbookImport function.
     * Therefore, we are only validating the object without using the parse result.
     */
    parseData(req.body.data);

    const result = await startWorkbookImport(
        {ctx: req.ctx},
        {
            data: req.body.data,
            title: body.title,
            description: body.description,
            collectionId: body.collectionId,
        },
    );

    res.status(200).send(responseModel.format(result));
};

startWorkbookImportController.api = {
    summary: 'Start workbook import',
    tags: [ApiTag.Workbooks],
    request: {
        body: {
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: requestSchema.body.extend({
                        data: workbookExportDataWithHashSchema,
                    }),
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
