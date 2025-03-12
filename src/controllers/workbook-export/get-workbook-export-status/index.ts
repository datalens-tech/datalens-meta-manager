import {AppRouteHandler} from '@gravity-ui/expresskit';

import {ApiTag, CONTENT_TYPE_JSON} from '../../../components/api-docs';
import {makeReqParser, z} from '../../../components/zod';
import {getWorkbookExportStatus} from '../../../services/export';
import {workbookExportStatusModel} from '../response-models';

const requestSchema = {
    params: z.object({
        exportId: z.string(),
    }),
};

const parseReq = makeReqParser(requestSchema);

export const getWorkbookExportStatusController: AppRouteHandler = async (req, res) => {
    const {params} = await parseReq(req);

    const result = await getWorkbookExportStatus(
        {ctx: req.ctx},
        {
            exportId: params.exportId,
        },
    );

    res.status(200).send(workbookExportStatusModel.format(result));
};

getWorkbookExportStatusController.api = {
    summary: 'Get workbook export status',
    tags: [ApiTag.Workbooks],
    request: {
        params: requestSchema.params,
    },
    responses: {
        200: {
            description: workbookExportStatusModel.schema.description ?? '',
            content: {
                [CONTENT_TYPE_JSON]: {
                    schema: workbookExportStatusModel.schema,
                },
            },
        },
    },
};
