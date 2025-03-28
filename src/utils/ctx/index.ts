import {AppContext, AppError} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

import {CtxUser} from '../../components/auth/types/user';
import {TRANSFER_ERROR} from '../../constants';

export const getCtxRequestIdWithFallback = (ctx: AppContext): string => {
    return ctx.get('requestId') ?? uuidv4();
};

export const getCtxUserSafe = (ctx: AppContext): CtxUser | undefined => {
    return ctx.get('user');
};

export const getCtxUser = (ctx: AppContext): CtxUser => {
    const user = getCtxUserSafe(ctx);

    if (!user) {
        throw new AppError(TRANSFER_ERROR.NO_USER_IN_CONTEXT, {
            code: TRANSFER_ERROR.NO_USER_IN_CONTEXT,
        });
    }

    return user;
};
