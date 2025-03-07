import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import type {ActivitiesDeps} from '../../../types';

export type SaveWorkbookArgs = {
    exportId: string;
    workbookId: string;
};

export async function saveWorkbook(
    {models: {ExportModel}, ctx, gatewayApi}: ActivitiesDeps,
    {exportId, workbookId}: SaveWorkbookArgs,
): Promise<void> {
    const response = await gatewayApi.us._getWorkbook({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {workbookId},
    });

    const {responseData} = response;

    await ExportModel.query(ExportModel.primary)
        .patch({
            data: raw(`jsonb_set(??, '{workbook}', ?)`, [
                'data',
                JSON.stringify({
                    title: responseData.title,
                    description: responseData.description,
                    meta: responseData.meta,
                }),
            ]),
        })
        .where({
            exportId,
        });
}
