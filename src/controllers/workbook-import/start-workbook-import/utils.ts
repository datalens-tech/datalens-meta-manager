import {AppError} from '@gravity-ui/nodekit';

import {META_MANAGER_ERROR} from '../../../constants';
import {WorkbookExportDataWithHash} from '../../../types/workbook-export';
import {isObject} from '../../../utils';

const validateWorkbookExportEntriesData = (obj: unknown, fieldName: string): void => {
    if (obj === undefined) {
        return;
    }

    if (!isObject(obj)) {
        throw new AppError(`data.export.${fieldName} must be an object.`, {
            code: META_MANAGER_ERROR.VALIDATION_ERROR,
        });
    }

    for (const key in obj) {
        if (!isObject(obj[key])) {
            throw new AppError(`Values in data.export.${fieldName} must be objects.`, {
                code: META_MANAGER_ERROR.VALIDATION_ERROR,
            });
        }
    }
};

export const validateWorkbookExportDataWithHash = (
    data: unknown,
): data is WorkbookExportDataWithHash => {
    const obj = data as Partial<WorkbookExportDataWithHash>;

    if (!isObject(obj)) {
        throw new AppError(`data must be an object.`, {
            code: META_MANAGER_ERROR.VALIDATION_ERROR,
        });
    }

    if (typeof obj.hash !== 'string') {
        throw new AppError(`data.hash must be a string.`, {
            code: META_MANAGER_ERROR.VALIDATION_ERROR,
        });
    }

    if (!isObject(obj.export)) {
        throw new AppError(`data.export must be an object.`, {
            code: META_MANAGER_ERROR.VALIDATION_ERROR,
        });
    }

    if (typeof obj.export.version !== 'string') {
        throw new AppError(`data.export.version must be a string.`, {
            code: META_MANAGER_ERROR.VALIDATION_ERROR,
        });
    }

    validateWorkbookExportEntriesData(obj.export.connection, 'connection');
    validateWorkbookExportEntriesData(obj.export.dataset, 'dataset');
    validateWorkbookExportEntriesData(obj.export.widget, 'widget');
    validateWorkbookExportEntriesData(obj.export.dash, 'dash');

    return true;
};
