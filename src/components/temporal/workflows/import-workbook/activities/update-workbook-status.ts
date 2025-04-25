import {makeTenantIdHeader} from '../../../../../utils';
import {WorkbookStatus} from '../../../../gateway/schema/us/types/workbook';
import type {ActivitiesDeps} from '../../../types';
import {prepareGatewayRestError} from '../../utils';
import {ImportWorkbookArgs} from '../types';

export type UpdateWorkbookStatusArgs = {
    workflowArgs: ImportWorkbookArgs;
    status: WorkbookStatus;
};

export const updateWorkbookStatus = async (
    {gatewayApi, ctx}: ActivitiesDeps,
    {workflowArgs, status}: UpdateWorkbookStatusArgs,
): Promise<void> => {
    const {workbookId, tenantId, requestId} = workflowArgs;

    try {
        await gatewayApi.us._updateWorkbook({
            ctx,
            headers: {
                ...makeTenantIdHeader(tenantId),
            },
            requestId,
            args: {
                workbookId,
                status,
            },
        });
    } catch (error: unknown) {
        throw prepareGatewayRestError(error);
    }
};
