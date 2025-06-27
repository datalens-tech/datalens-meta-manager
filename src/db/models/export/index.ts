import {Model} from '../..';
import {BigIntId} from '../../../types';
import {ExportEntryModel, ExportEntryModelColumn} from '../export-entry';

import {ExportStatus} from './types';

export {ExportStatus};

export const ExportModelColumn = {
    ExportId: 'exportId',
    Status: 'status',
    Meta: 'meta',
    Data: 'data',
    Notifications: 'notifications',
    CreatedBy: 'createdBy',
    CreatedAt: 'createdAt',
    UpdatedAt: 'updatedAt',
    ExpiredAt: 'expiredAt',
} as const;

export class ExportModel<
    Meta extends Record<string, unknown>,
    Data extends Record<string, unknown>,
    Notifications extends Record<string, unknown> | Array<unknown>,
> extends Model {
    static get tableName() {
        return 'exports';
    }

    static get idColumn() {
        return ExportModelColumn.ExportId;
    }

    static get relationMappings() {
        return {
            entries: {
                relation: Model.HasManyRelation,
                modelClass: ExportEntryModel,
                join: {
                    from: `${ExportModel.tableName}.${ExportModelColumn.ExportId}`,
                    to: `${ExportEntryModel.tableName}.${ExportEntryModelColumn.ExportId}`,
                },
            },
        };
    }

    exportId!: BigIntId;
    status!: ExportStatus;
    meta!: Meta;
    data!: Data;
    notifications!: Notifications | null;
    createdBy!: string;
    createdAt!: string;
    updatedAt!: string;
    expiredAt!: string;

    /** Relations */
    entries?: ExportEntryModel[];
}
