import {AppContext} from '@gravity-ui/nodekit';

import {AUTHORIZATION_HEADER, DL_AUTH_HEADER_KEY, TENANT_ID_HEADER} from '../../../constants';
import {makeTenantIdHeader} from '../../../utils';
import {getCtxInfo, getCtxUser} from '../../../utils/ctx';

export const getDefaultUsHeaders = (
    ctx: AppContext,
): {
    [AUTHORIZATION_HEADER]?: string;
    [TENANT_ID_HEADER]?: string;
} => {
    const user = getCtxUser(ctx);
    const info = getCtxInfo(ctx);

    return {
        ...(user?.accessToken
            ? {[AUTHORIZATION_HEADER]: `${DL_AUTH_HEADER_KEY} ${user.accessToken}`}
            : {}),

        ...makeTenantIdHeader(info.tenantId),
    };
};
