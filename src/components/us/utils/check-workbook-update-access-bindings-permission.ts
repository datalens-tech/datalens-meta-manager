import {AppContext, AppError} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

import {TRANSFER_ERROR} from '../../../constants';
import {registry} from '../../../registry';

export const checkWorkbookUpdateAccessBindingsPermission = async ({
    ctx,
    workbookId,
}: {
    ctx: AppContext;
    workbookId: string;
}) => {
    const {gatewayApi} = registry.getGatewayApi();

    const {
        responseData: {permissions},
    } = await gatewayApi.us.getWorkbook({
        ctx,
        headers: {},
        requestId: ctx.get('requestId') ?? uuidv4(),
        args: {workbookId, includePermissionsInfo: true},
    });

    if (!permissions?.updateAccessBindings) {
        throw new AppError(
            'The user does not have sufficient permissions to perform this action.',
            {
                code: TRANSFER_ERROR.WORKBOOK_OPERATION_FORBIDDEN,
            },
        );
    }
};
