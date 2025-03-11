import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ExportModelColumn} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type ExportDatasetArgs = {
    exportId: string;
    datasetId: string;
    idMapping: Record<string, string>;
};

export const exportDataset = async (
    {models: {ExportModel}, ctx, gatewayApi}: ActivitiesDeps,
    {exportId, datasetId, idMapping}: ExportDatasetArgs,
): Promise<void> => {
    const {
        responseData: {dataset, notifications},
    } = await gatewayApi.bi.exportDataset({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {datasetId, idMapping},
    });

    await ExportModel.query(ExportModel.primary)
        .patch({
            data: raw(
                "jsonb_set(??, '{datasets}', (COALESCE(data->'datasets', '[]'::jsonb) || ?::jsonb))",
                [ExportModelColumn.Data, {data: dataset, notifications}],
            ),
        })
        .where({
            exportId,
        });
};
