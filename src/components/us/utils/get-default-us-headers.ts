import {AppContext} from '@gravity-ui/nodekit';

import {AUTHORIZATION_HEADER, DL_AUTH_HEADER_KEY} from '../../../constants';
import {getCtxUser} from '../../../utils/ctx';

export const getDefaultUsHeaders = (
    ctx: AppContext,
): {
    [AUTHORIZATION_HEADER]?: string;
} => {
    const user = getCtxUser(ctx);

    return {
        [AUTHORIZATION_HEADER]: user?.accessToken
            ? `${DL_AUTH_HEADER_KEY} ${user.accessToken}`
            : undefined,
    };
};
