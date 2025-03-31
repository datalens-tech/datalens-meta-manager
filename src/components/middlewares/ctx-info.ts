import {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {TENANT_ID_HEADER} from '../../constants';

export const ctxInfo = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers[TENANT_ID_HEADER] as string;

    req.originalContext.set('info', {
        tenantId,
    });

    req.ctx.log('REQUEST_INFO', {
        ctxTenantId: tenantId,
    });

    next();
};
