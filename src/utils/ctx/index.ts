import {AppContext} from '@gravity-ui/nodekit';
import {v4 as uuidv4} from 'uuid';

export const getCtxRequestIdWithFallback = (ctx: AppContext): string => {
    return ctx.get('requestId') ?? uuidv4();
};
