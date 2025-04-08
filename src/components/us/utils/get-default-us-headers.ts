import {AppContext} from '@gravity-ui/nodekit';

import {AUTHORIZATION_HEADER, DL_AUTH_HEADER_KEY, TENANT_ID_HEADER} from '../../../constants';
import {getCtxInfo, getCtxUser} from '../../../utils/ctx';

export const makeTenantIdHeader = (tenantId: string | undefined): {[TENANT_ID_HEADER]?: string} => {
    return tenantId ? {[TENANT_ID_HEADER]: tenantId} : {};
};

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
