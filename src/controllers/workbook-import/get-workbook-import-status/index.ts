import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeReqParser, z} from '../../../components/zod';
import {getWorkbookImportStatus} from '../../../services/import';
import {workbookImportStatusModel} from '../response-models';

const requestSchema = {
    params: z.object({
        importId: z.string(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const getWorkbookImportStatusController: AppRouteHandler = async (req, res) => {
    const {params} = await parseReq(req);

    const result = await getWorkbookImportStatus(
        {ctx: req.ctx},
        {
            importId: params.importId,
        },
    );

    res.status(200).send(workbookImportStatusModel.format(result));
};

getWorkbookImportStatusController.api = {
    summary: 'Get workbook import status',
    tags: [ApiTag.Workbooks],
    request: {
        params: requestSchema.params,
    },
    responses: {
        200: {
            description: workbookImportStatusModel.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: workbookImportStatusModel.schema,
                },
            },
        },
    },
};
