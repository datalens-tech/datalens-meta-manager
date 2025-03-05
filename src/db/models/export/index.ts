import {Model} from '../..';

import {ExportStatus} from './types';

export {ExportStatus};

export const ExportModelColumn = {
    ExportId: 'exportId',
    Status: 'status',
    Data: 'data',
    Error: 'error',
    CreatedBy: 'createdBy',
    CreatedAt: 'createdAt',
    UpdatedAt: 'updatedAt',
    ExpiredAt: 'expiredAt',
} as const;

export class ExportModel extends Model {
    static get tableName() {
        return 'exports';
    }

    static get idColumn() {
        return 'exportId';
    }

    exportId!: string;
    status!: ExportStatus;
    data!: Record<string, unknown>;
    error!: Record<string, unknown> | null;
    createdBy!: string;
    createdAt!: string;
    updatedAt!: string;
    expiredAt!: string;
}
