import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../components/api-docs';
import {makeReqParser, z} from '../components/zod';
import {ExportModel, ExportModelColumn} from '../db/models';

import {test} from './response-models';

const requestSchema = {
    query: z.object({
        field: z.string().optional(),
    }),
    body: z.object({
        field: z.string().optional(),
    }),
};

export type CreateCollectionReqBody = z.infer<typeof requestSchema.body>;

const parseReq = makeReqParser(requestSchema);

export const testController: AppRouteHandler = async (req, res) => {
    const {query} = await parseReq(req);

    const result = await ExportModel.query(ExportModel.replica)
        .select([ExportModelColumn.ExportId])
        .first()
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    res.status(200).send({result: result?.exportId, param: query.field});
};

testController.api = {
    summary: 'Test',
    tags: [ApiTag.Test],
    request: {
        query: requestSchema.query,
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
            description: test.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: test.schema,
                },
            },
        },
    },
};
