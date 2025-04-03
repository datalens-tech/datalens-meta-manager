import {AppError} from '@gravity-ui/nodekit';
import {WorkflowNotFoundError} from '@temporalio/common';
import {HttpStatusCode} from 'axios';
import {DBError} from 'db-errors';
import PG_ERRORS from 'pg-error-constants';

import {META_MANAGER_ERROR} from '../../constants';

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
                    code: HttpStatusCode.Conflict,
                    response: {
                        code: META_MANAGER_ERROR.DB_UNIQUE_VIOLATION,
                        message: 'The entity already exists',
                    },
                };
            }
            default:
                return {
                    code: HttpStatusCode.InternalServerError,
                    response: {
                        message: 'Database error',
                    },
                };
        }
    }

    if (error instanceof AppError) {
        const {code, message, details} = error;

        switch (code) {
            case META_MANAGER_ERROR.VALIDATION_ERROR: {
                return {
                    code: HttpStatusCode.BadRequest,
                    response: {
                        code,
                        message,
                        details,
                    },
                };
            }

            case META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST: {
                return {
                    code: HttpStatusCode.NotFound,
                    response: {
                        code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_EXIST,
                        message: "The export doesn't exist",
                    },
                };
            }

            case META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED: {
                return {
                    code: HttpStatusCode.Conflict,
                    response: {
                        code: META_MANAGER_ERROR.WORKBOOK_EXPORT_NOT_COMPLETED,
                        message:
                            'The export is not completed. It is either still in progress or has failed.',
                    },
                };
            }

            case META_MANAGER_ERROR.WORKBOOK_IMPORT_NOT_EXIST: {
                return {
                    code: HttpStatusCode.NotFound,
                    response: {
                        code: META_MANAGER_ERROR.WORKBOOK_IMPORT_NOT_EXIST,
                        message: "The import doesn't exist",
                    },
                };
            }

            case META_MANAGER_ERROR.WORKBOOK_EXPORT_DATA_OUTDATED: {
                return {
                    code: HttpStatusCode.UnprocessableEntity,
                    response: {
                        code: META_MANAGER_ERROR.WORKBOOK_EXPORT_DATA_OUTDATED,
                        message:
                            'The provided export data version is outdated. Please export the data again.',
                    },
                };
            }

            case META_MANAGER_ERROR.WORKBOOK_OPERATION_FORBIDDEN: {
                return {
                    code: HttpStatusCode.Forbidden,
                    response: {
                        code,
                        message,
                    },
                };
            }

            case META_MANAGER_ERROR.WORKBOOK_ALREADY_EXISTS: {
                return {
                    code: HttpStatusCode.Conflict,
                    response: {
                        code,
                        message,
                    },
                };
            }
        }

        return {
            code: HttpStatusCode.InternalServerError,
            response: {
                message: 'Internal Server Error',
            },
        };
    }

    if (error instanceof WorkflowNotFoundError) {
        return {
            code: HttpStatusCode.NotFound,
            response: {
                message: error.message,
            },
        };
    }

    return {
        code: HttpStatusCode.InternalServerError,
        response: {
            message: 'Internal Server Error',
        },
    };
};
