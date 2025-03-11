import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ExportModelColumn} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type ExportConnectionArgs = {
    exportId: string;
    connectionId: string;
};

export const exportConnection = async (
    {models: {ExportModel}, ctx, gatewayApi}: ActivitiesDeps,
    {exportId, connectionId}: ExportConnectionArgs,
): Promise<void> => {
    const {
        responseData: {connection, notifications},
    } = await gatewayApi.bi.exportConnection({
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
                [ExportModelColumn.Data, {data: connection, notifications}],
            ),
        })
        .where({
            exportId,
        });
};
