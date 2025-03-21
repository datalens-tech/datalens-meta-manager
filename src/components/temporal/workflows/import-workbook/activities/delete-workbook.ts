import {v4 as uuidv4} from 'uuid';

import type {ActivitiesDeps} from '../../../types';

export type DeleteWorkbookArgs = {
    workbookId: string;
};

export const deleteWorkbook = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workbookId}: DeleteWorkbookArgs,
): Promise<void> => {
    await gatewayApi.us._deleteWorkbook({
        ctx,
        headers: {},
        authArgs: {},
        requestId: uuidv4(),
        args: {
            workbookId,
        },
    });
};
