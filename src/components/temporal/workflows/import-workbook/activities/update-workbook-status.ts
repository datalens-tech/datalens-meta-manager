import {WorkbookStatus} from '../../../../gateway/schema/us/types/workbook';
import {makeTenantIdHeader} from '../../../../us/utils';
import type {ActivitiesDeps} from '../../../types';
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
};
