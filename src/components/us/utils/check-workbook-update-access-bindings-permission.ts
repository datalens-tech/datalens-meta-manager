import {AppContext, AppError} from '@gravity-ui/nodekit';

import {AUTHORIZATION_HEADER, TRANSFER_ERROR} from '../../../constants';
import {registry} from '../../../registry';
import {createAuthHeader} from '../../../utils/auth';
import {getCtxRequestIdWithFallback, getCtxUser} from '../../../utils/ctx';
import {WorkbookPermissions} from '../../gateway/schema/us/types/workbook';

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

    const user = getCtxUser(ctx);

    const {
        responseData: {permissions},
    } = await gatewayApi.us.getWorkbook({
        ctx,
        headers: {
            [AUTHORIZATION_HEADER]: createAuthHeader(user.accessToken),
        },
        requestId: getCtxRequestIdWithFallback(ctx),
        args: {workbookId, includePermissionsInfo: true},
    });

    checkWorkbookAccessByPermissions({permissions});
};
