import {PartialModelObject, raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {ExportModel, ExportModelColumn} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type ExportDatasetArgs = {
    exportId: string;
    datasetId: string;
    mockDatasetId: string;
    idMapping: Record<string, string>;
};

export const exportDataset = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {exportId, datasetId, mockDatasetId, idMapping}: ExportDatasetArgs,
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

    const update: PartialModelObject<ExportModel> = {
        data: raw(
            "jsonb_set(??, '{datasets}', (COALESCE(??->'datasets', '{}'::jsonb) || ?::jsonb))",
            [
                ExportModelColumn.Data,
                ExportModelColumn.Data,
                {
                    [mockDatasetId]: {
                        data: dataset,
                    },
                },
            ],
        ),
    };

    if (notifications.length > 0) {
        update.notifications = raw(
            "jsonb_set(COALESCE(??, '{}'), '{datasets}', (COALESCE(??->'datasets', '[]') || ?))",
            [
                ExportModelColumn.Notifications,
                ExportModelColumn.Notifications,
                {
                    entryId: datasetId,
                    notifications,
                },
            ],
        );
    }

    await ExportModel.query(ExportModel.primary).patch(update).where({
        exportId,
    });
};
