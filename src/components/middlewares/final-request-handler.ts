import {Request, Response} from '@gravity-ui/expresskit';
import {AppError} from '@gravity-ui/nodekit';

import {prepareErrorResponse} from '../error/error-response-presenter';

export const logError = (error: AppError, req: Request) => {
    if (error instanceof AppError) {
        const {message} = error;
        req.ctx.log(message, {error});
    } else {
        req.ctx.logError('Unhandled Meta Manager error', error);
    }
};

export const finalRequestHandler = (error: AppError, req: Request, res: Response) => {
    logError(error, req);

    const {code, response} = prepareErrorResponse(error);

    res.status(code).send(response);
};
