import {AppError} from '@gravity-ui/nodekit';
import {raw} from 'objection';
import {v4 as uuidv4} from 'uuid';

import {TRANSFER_ERROR} from '../../../../../constants';
import {ExportModelColumn, ImportModel} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

export type ImportConnectionArgs = {
    importId: string;
    workbookId: string;
    mockConnectionId: string;
};

export type ImportConnectionResult = {
    connectionId: string;
};

export const importConnection = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {importId, workbookId, mockConnectionId}: ImportConnectionArgs,
): Promise<ImportConnectionResult> => {
    const result = (await ImportModel.query(ImportModel.primary)
        .select(
            raw('??->?->? as connection', [
                ExportModelColumn.Data,
                'connections',
                mockConnectionId,
            ]),
        )
        .first()
        .where({
            importId,
        })) as unknown as {
        connection: {data: Record<string, unknown>} | null;
    };

    if (!result.connection) {
        throw new AppError(`No connection data for id: ${mockConnectionId}`, {
            code: TRANSFER_ERROR.INVALID_IMPORT_CONNECTION_DATA,
        });
    }

    const {
        responseData: {id},
    } = await gatewayApi.bi.importConnection({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {
            data: {
                workbookId,
                connection: result.connection.data,
            },
        },
    });

    return {connectionId: id};
};
