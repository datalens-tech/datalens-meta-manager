import {AppContext, AppError} from '@gravity-ui/nodekit';

import {TRANSFER_ERROR} from '../../../constants';
import {registry} from '../../../registry';
import {getCtxRequestIdWithFallback} from '../../../utils/ctx';
import {WorkbookPermissions} from '../../gateway/schema/us/types/workbook';

import {getDefaultUsHeaders} from './get-default-us-headers';

export const checkWorkbookAccessByPermissions = ({
    permissions,
}: {
    permissions?: WorkbookPermissions;
}): void => {
    if (!permissions?.updateAccessBindings) {
        throw new AppError(
            'The user does not have sufficient permissions to perform this action.',
            {
                code: TRANSFER_ERROR.WORKBOOK_OPERATION_FORBIDDEN,
            },
        );
    }
};

export const checkWorkbookAccessById = async ({
    ctx,
    workbookId,
}: {
    ctx: AppContext;
    workbookId: string;
}): Promise<void> => {
    const {gatewayApi} = registry.getGatewayApi();

    const {
        responseData: {permissions},
    } = await gatewayApi.us.getWorkbook({
        ctx,
        headers: getDefaultUsHeaders(ctx),
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {workbookId, includePermissionsInfo: true},
    });

    checkWorkbookAccessByPermissions({permissions});
};
