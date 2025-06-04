import {AppContext, AppError} from '@gravity-ui/nodekit';
import {HttpStatusCode} from 'axios';

import {META_MANAGER_ERROR} from '../../../constants';
import {registry} from '../../../registry';
import {getCtxRequestIdWithFallback} from '../../../utils/ctx';
import {isGatewayError} from '../../gateway';
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
                code: META_MANAGER_ERROR.WORKBOOK_OPERATION_FORBIDDEN,
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

    let permissions: WorkbookPermissions | undefined;

    try {
        const {responseData} = await gatewayApi.us.getWorkbook({
            ctx,
            headers: getDefaultUsHeaders(ctx),
            requestId: getCtxRequestIdWithFallback(ctx),
            args: {workbookId, includePermissionsInfo: true},
        });

        permissions = responseData.permissions;
    } catch (error) {
        if (isGatewayError(error) && error.error.status === HttpStatusCode.NotFound) {
            throw new AppError(error.error.message, {
                code: META_MANAGER_ERROR.WORKBOOK_NOT_EXIST,
            });
        }

        throw error;
    }

    checkWorkbookAccessByPermissions({permissions});
};
