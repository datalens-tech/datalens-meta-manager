import {registry} from '../../../../../registry';
import {makeTenantIdHeader} from '../../../../../utils';
import type {ActivitiesDeps} from '../../../types';
import {prepareGatewayRestError} from '../../utils';
import {ImportWorkbookArgs} from '../types';

export type DeleteWorkbookArgs = {
    workflowArgs: ImportWorkbookArgs;
};

export const deleteWorkbook = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workflowArgs}: DeleteWorkbookArgs,
): Promise<void> => {
    const {workbookId, tenantId, requestId} = workflowArgs;

    const {getAuthArgsUsPrivate} = registry.common.functions.get();

    try {
        await gatewayApi.us._deleteWorkbook({
            ctx,
            headers: {
                ...makeTenantIdHeader(tenantId),
            },
            requestId,
            args: {
                workbookId,
            },
            authArgs: await getAuthArgsUsPrivate({ctx}),
        });
    } catch (error: unknown) {
        throw prepareGatewayRestError(error);
    }
};
