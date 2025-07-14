import {Model} from '../..';
import {BigIntId} from '../../../types';
import {ExportData} from '../../../types/workbook-export';

import {ImportMeta, ImportNotifications, ImportStatus} from './types';

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
    TenantId: 'tenantId',
} as const;

export class ImportModel extends Model {
    static get tableName() {
        return 'imports';
    }

    static get idColumn() {
        return ImportModelColumn.ImportId;
    }

    importId!: BigIntId;
    status!: ImportStatus;
    meta!: ImportMeta;
    data!: ExportData;
    notifications!: ImportNotifications | null;
    createdBy!: string;
    createdAt!: string;
    updatedAt!: string;
    expiredAt!: string;
    tenantId!: string;
}
