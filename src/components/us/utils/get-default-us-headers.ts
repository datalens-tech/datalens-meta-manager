import {AppContext} from '@gravity-ui/nodekit';

import {AUTHORIZATION_HEADER, DL_AUTH_HEADER_KEY} from '../../../constants';
import {registry} from '../../../registry';
import {makeTenantIdHeader} from '../../../utils';
import {getCtxInfo, getCtxUser} from '../../../utils/ctx';

export const getDefaultUsHeaders = (ctx: AppContext): Record<string, string> => {
    const {getAdditionalDefaultUsHeaders} = registry.common.functions.get();

    const user = getCtxUser(ctx);
    const info = getCtxInfo(ctx);

    return {
        ...(user?.accessToken
            ? {[AUTHORIZATION_HEADER]: `${DL_AUTH_HEADER_KEY} ${user.accessToken}`}
            : {}),

        ...makeTenantIdHeader(info.tenantId),

        ...getAdditionalDefaultUsHeaders({ctx}),
    };
};
