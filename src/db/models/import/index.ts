import {Model} from '../..';

import {ImportStatus} from './types';

export {ImportStatus};

export const ImportModelColumn = {
    ImportId: 'importId',
    Status: 'status',
    Meta: 'meta',
    Data: 'data',
    Notifications: 'notifications',
    CreatedBy: 'createdBy',
    CreatedAt: 'createdAt',
    UpdatedAt: 'updatedAt',
    ExpiredAt: 'expiredAt',
} as const;

export class ImportModel<
    Meta extends Record<string, unknown>,
    Data extends Record<string, unknown>,
    Notifications extends Record<string, unknown> | Array<unknown>,
> extends Model {
    static get tableName() {
        return 'imports';
    }

    static get idColumn() {
        return ImportModelColumn.ImportId;
    }

    importId!: string;
    status!: ImportStatus;
    meta!: Meta;
    data!: Data;
    notifications!: Notifications | null;
    createdBy!: string;
    createdAt!: string;
    updatedAt!: string;
    expiredAt!: string;
}
