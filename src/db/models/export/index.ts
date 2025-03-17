import {Model} from '../..';

import {ExportStatus} from './types';

export {ExportStatus};

export const ExportModelColumn = {
    ExportId: 'exportId',
    Status: 'status',
    Meta: 'meta',
    Data: 'data',
    Notifications: 'notifications',
    Errors: 'errors',
    CreatedBy: 'createdBy',
    CreatedAt: 'createdAt',
    UpdatedAt: 'updatedAt',
    ExpiredAt: 'expiredAt',
} as const;

export class ExportModel<
    Meta extends Record<string, unknown>,
    Data extends Record<string, unknown>,
    Errors extends Record<string, unknown>,
    Notifications extends Record<string, unknown>,
> extends Model {
    static get tableName() {
        return 'exports';
    }

    static get idColumn() {
        return 'exportId';
    }

    exportId!: string;
    status!: ExportStatus;
    meta!: Meta;
    data!: Data;
    errors!: Errors | null;
    notifications!: Notifications | null;
    createdBy!: string;
    createdAt!: string;
    updatedAt!: string;
    expiredAt!: string;
}
