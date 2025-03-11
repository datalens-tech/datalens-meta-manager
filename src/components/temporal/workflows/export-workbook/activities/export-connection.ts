import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import type {ActivitiesDeps} from '../../../types';

export type ExportConnectionArgs = {
    exportId: string;
    connectionId: string;
};

export const exportConnection = async (
    {models: {ExportModel}, ctx, gatewayApi}: ActivitiesDeps,
    {exportId, connectionId}: ExportConnectionArgs,
): Promise<void> => {
    const {responseData} = await gatewayApi.bi.exportConnection({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {connectionId},
    });

    await ExportModel.query(ExportModel.primary)
        .patch({
            data: raw(
                "jsonb_set(??, '{connections}', (COALESCE(data->'connections', '[]'::jsonb) || ?::jsonb))",
                [
                    'data',
                    {data: responseData.connection, notifications: responseData.notifications},
                ],
            ),
        })
        .where({
            exportId,
        });
};
