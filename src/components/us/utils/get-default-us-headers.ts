import {AppContext} from '@gravity-ui/nodekit';

import {AUTHORIZATION_HEADER, DL_AUTH_HEADER_KEY} from '../../../constants';
import {registry} from '../../../registry';
import {makeTenantIdHeader} from '../../../utils';
import {getCtxInfo, getCtxSubject} from '../../../utils/ctx';

export const getDefaultUsHeaders = (ctx: AppContext): Record<string, string> => {
    const {getAdditionalDefaultUsHeaders} = registry.common.functions.get();

    const subject = getCtxSubject(ctx);
    const info = getCtxInfo(ctx);

    return {
        ...(subject?.accessToken
            ? {[AUTHORIZATION_HEADER]: `${DL_AUTH_HEADER_KEY} ${subject.accessToken}`}
            : {}),

        ...makeTenantIdHeader(info.tenantId),

        ...getAdditionalDefaultUsHeaders({ctx}),
    };
};
