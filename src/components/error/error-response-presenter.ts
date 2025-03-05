import {AppError} from '@gravity-ui/nodekit';
import {DBError} from 'db-errors';
import PG_ERRORS from 'pg-error-constants';

import {TRANSFER_ERROR} from '../../constants/errors';

function getDBErrorCode(error: DBError): string {
    const nativeError = error.nativeError as Error & {code?: string};
    return nativeError?.code || '';
}

type PreparedErrorResponse = {
    code: number;
    response: {
        code?: string;
        message: string;
    };
};

export const prepareErrorResponse = (error: AppError | DBError): PreparedErrorResponse => {
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

    return {
        code: 500,
        response: {
            message: 'Internal Server Error',
        },
    };
};
