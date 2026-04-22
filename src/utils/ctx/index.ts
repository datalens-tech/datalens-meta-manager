import {AppContext, AppError} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

import {CtxSubject} from '../../components/auth/types/subject';
import {META_MANAGER_ERROR} from '../../constants';
import {CtxInfo} from '../../types/ctx';

export const getCtxRequestIdWithFallback = (ctx: AppContext): string => {
    return ctx.get('requestId') ?? uuidv4();
};

export const getCtxSubject = (ctx: AppContext): CtxSubject | undefined => {
    return ctx.get('subject');
};

export const getCtxInfo = (ctx: AppContext): CtxInfo => {
    return ctx.get('info');
};

export const getCtxTenantId = (ctx: AppContext): string | undefined => {
    return ctx.get('info').tenantId;
};

export const getCtxTenantIdUnsafe = (ctx: AppContext): string => {
    const tenantId = getCtxTenantId(ctx);

    if (!tenantId) {
        throw new AppError(META_MANAGER_ERROR.TENANT_ID_MISSING_IN_CONTEXT, {
            code: META_MANAGER_ERROR.TENANT_ID_MISSING_IN_CONTEXT,
        });
    }

    return tenantId;
};
