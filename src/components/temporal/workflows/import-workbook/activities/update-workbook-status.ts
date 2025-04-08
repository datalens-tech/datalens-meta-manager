import {v4 as uuidv4} from 'uuid';

import {WorkbookStatus} from '../../../../gateway/schema/us/types/workbook';
import {makeTenantIdHeader} from '../../../../us/utils';
import type {ActivitiesDeps} from '../../../types';

export type UpdateWorkbookStatusArgs = {
    workbookId: string;
    status: WorkbookStatus;
    tenantId?: string;
};

export const updateWorkbookStatus = async (
    {gatewayApi, ctx}: ActivitiesDeps,
    {workbookId, tenantId, status}: UpdateWorkbookStatusArgs,
): Promise<void> => {
    await gatewayApi.us._updateWorkbook({
        ctx,
        headers: {
            ...makeTenantIdHeader(tenantId),
        },
        requestId: uuidv4(),
        args: {
            workbookId,
            status,
        },
    });
};
