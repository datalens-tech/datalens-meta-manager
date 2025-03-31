import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeReqParser, z, zc} from '../../../components/zod';
import {cancelWorkbookImport} from '../../../services/import';

import {responseModel} from './response-model';

const requestSchema = {
    params: z.object({
        importId: zc.decodeId(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const cancelWorkbookImportController: AppRouteHandler = async (req, res) => {
    const {params} = await parseReq(req);

    const result = await cancelWorkbookImport(
        {ctx: req.ctx},
        {
            importId: params.importId,
        },
    );

    res.status(200).send(responseModel.format(result));
};

cancelWorkbookImportController.api = {
    summary: 'Cancel workbook import',
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
