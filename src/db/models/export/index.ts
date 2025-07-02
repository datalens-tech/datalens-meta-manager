import {Model} from '../..';
import {BigIntId} from '../../../types';
import {ExportEntryModel, ExportEntryModelColumn} from '../export-entry';

import {ExportMeta, ExportNotifications, ExportStatus} from './types';

export {ExportStatus};

export const ExportModelColumn = {
    ExportId: 'exportId',
    Status: 'status',
    Meta: 'meta',
    Notifications: 'notifications',
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
    meta!: ExportMeta;
    notifications!: ExportNotifications | null;
    createdBy!: string;
    createdAt!: string;
    updatedAt!: string;
    expiredAt!: string;

    /** Relations */
    entries?: ExportEntryModel[];
}
