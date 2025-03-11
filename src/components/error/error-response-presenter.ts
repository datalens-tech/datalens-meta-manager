import {AppError} from '@gravity-ui/nodekit';
import {WorkflowNotFoundError} from '@temporalio/common';
import {DBError} from 'db-errors';
import PG_ERRORS from 'pg-error-constants';

import {TRANSFER_ERROR} from '../../constants';

const getDBErrorCode = (error: DBError): string => {
    const nativeError = error.nativeError as Error & {code?: string};
    return nativeError?.code || '';
};

type PreparedErrorResponse = {
    code: number;
    response: {
        code?: string;
        message: string;
        details?: unknown;
    };
};

export const prepareErrorResponse = (
    error: AppError | DBError | unknown,
): PreparedErrorResponse => {
    if (error instanceof DBError) {
        const dbCode = getDBErrorCode(error);

        switch (dbCode) {
            case PG_ERRORS.UNIQUE_VIOLATION: {
                return {
                    code: 400,
                    response: {
                        code: TRANSFER_ERROR.DB_UNIQUE_VIOLATION,
                        message: 'The entity already exists',
                    },
                };
            }
            default:
                return {
                    code: 500,
                    response: {
                        message: 'Database error',
                    },
                };
        }
    }

    if (error instanceof AppError) {
        const {code, message, details} = error;

        switch (code) {
            case TRANSFER_ERROR.VALIDATION_ERROR: {
                return {
                    code: 400,
                    response: {
                        code,
                        message,
                        details,
                    },
                };
            }

            case TRANSFER_ERROR.EXPORT_NOT_EXIST: {
                return {
                    code: 404,
                    response: {
                        code: TRANSFER_ERROR.EXPORT_NOT_EXIST,
                        message: "The exports doesn't exist",
                    },
                };
            }
        }

        return {
            code: 500,
            response: {
                message: 'Internal Server Error',
            },
        };
    }

    if (error instanceof WorkflowNotFoundError) {
        return {
            code: 404,
            response: {
                message: error.message,
            },
        };
    }

    return {
        code: 500,
        response: {
            message: 'Internal Server Error',
        },
    };
};
