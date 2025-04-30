import {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {TENANT_ID_HEADER} from '../../constants';

export const ctxInfo = (req: Request, res: Response, next: NextFunction) => {
    const {multitenant} = req.ctx.config;

    let tenantId: string | undefined;

    if (multitenant) {
        tenantId = req.headers[TENANT_ID_HEADER] as string;
    }

    const {userId, login} = res.locals;

    const user = {userId, login};

    req.originalContext.set('info', {
        tenantId,
        user,
    });

    req.ctx.log('REQUEST_INFO', {
        ctxTenantId: tenantId,
    });

    next();
};
