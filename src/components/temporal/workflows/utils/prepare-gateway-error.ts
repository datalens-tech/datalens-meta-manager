import {ApplicationFailure} from '@temporalio/common';
import {HttpStatusCode} from 'axios';

import {GatewayError, isGatewayError} from '../../../gateway';

const isNonRetryableError = (error: GatewayError): boolean => {
    return (
        error.status === HttpStatusCode.BadRequest ||
        error.status === HttpStatusCode.Unauthorized ||
        error.status === HttpStatusCode.Forbidden ||
        error.status === HttpStatusCode.NotFound ||
        error.status === HttpStatusCode.Conflict ||
        error.status === HttpStatusCode.UnprocessableEntity
    );
};

export const prepareGatewayRestError = (error: unknown): ApplicationFailure | unknown => {
    if (isGatewayError(error)) {
        return ApplicationFailure.create({
            nonRetryable: isNonRetryableError(error.error),
            message: error.error.message,
            details: [error.error.status, error.error.code],
        });
    }

    return error;
};
