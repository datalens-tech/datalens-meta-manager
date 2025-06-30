import {Model} from '../..';
import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {BigIntId} from '../../../types';

import {ExportEntryNotification} from './types';

export const ExportEntryModelColumn = {
    ExportId: 'exportId',
    entryId: 'entryId',
    MockEntryId: 'mockEntryId',
    Scope: 'scope',
    Data: 'data',
    Notifications: 'notifications',
} as const;

export class ExportEntryModel extends Model {
    static get tableName() {
        return 'export_entries';
    }

    static get idColumn() {
        return [ExportEntryModelColumn.ExportId, ExportEntryModelColumn.MockEntryId];
    }

    exportId!: BigIntId;
    entryId!: string;
    mockEntryId!: string;
    scope!: EntryScope;
    data!: Record<string, unknown> | null;
    notifications!: ExportEntryNotification[] | null;
}
