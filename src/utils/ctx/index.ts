import {AppContext} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

import {CtxUser} from '../../components/auth/types/user';
import {CtxInfo} from '../../types/ctx';

export const getCtxRequestIdWithFallback = (ctx: AppContext): string => {
    return ctx.get('requestId') ?? uuidv4();
};

export const getCtxUser = (ctx: AppContext): CtxUser | undefined => {
    return ctx.get('user');
};

export const getCtxInfo = (ctx: AppContext): CtxInfo => {
    return ctx.get('info');
};
