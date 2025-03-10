import {Model} from '../..';

import type {ImportStatus} from './types';

export {ImportStatus};

export const ImportModelColumn = {
    ImportId: 'importId',
    Status: 'status',
    Data: 'data',
    IdsMap: 'idsMap',
    Error: 'error',
    CreatedBy: 'createdBy',
    CreatedAt: 'createdAt',
    UpdatedAt: 'updatedAt',
    ExpiredAt: 'expiredAt',
} as const;

export class ImportModel extends Model {
    static get tableName() {
        return 'imports';
    }

    static get idColumn() {
        return ImportModelColumn.ImportId;
    }

    importId!: string;
    status!: ImportStatus;
    data!: Record<string, any>;
    idsMap!: Record<string, any>;
    error!: Record<string, unknown> | null;
    createdBy!: string;
    createdAt!: string;
    updatedAt!: string;
    expiredAt!: string;
}
