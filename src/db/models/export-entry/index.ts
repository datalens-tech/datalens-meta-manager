import {Model} from '../..';
import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {BigIntId} from '../../../types';

export const ExportEntryModelColumn = {
    ExportId: 'exportId',
    MockEntryId: 'mockEntryId',
    Scope: 'scope',
    Data: 'data',
} as const;

export class ExportEntryModel extends Model {
    static get tableName() {
        return 'export_entries';
    }

    static get idColumn() {
        return [ExportEntryModelColumn.ExportId, ExportEntryModelColumn.MockEntryId];
    }

    exportId!: BigIntId;
    mockEntryId!: string;
    scope!: EntryScope;
    data!: Record<string, unknown> | null;
}
