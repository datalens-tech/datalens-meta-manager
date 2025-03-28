import {getCtxRequestIdWithFallback} from '../../../../../utils/ctx';
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
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {
            workbookId,
        },
    });
};
