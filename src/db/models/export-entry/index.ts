import {Model} from '../..';
import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {BigIntId} from '../../../types';
import {ExportModelColumn} from '../export';
import {WorkbookExportModel} from '../workbook-export';

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

    static get relationMappings() {
        return {
            export: {
                relation: Model.BelongsToOneRelation,
                modelClass: WorkbookExportModel,
                join: {
                    from: `${ExportEntryModel.tableName}.${ExportEntryModelColumn.ExportId}`,
                    to: `${WorkbookExportModel.tableName}.${ExportModelColumn.ExportId}`,
                },
            },
        };
    }

    exportId!: BigIntId;
    mockEntryId!: string;
    scope!: EntryScope;
    data!: Record<string, unknown> | null;

    /** Relations */
    export?: WorkbookExportModel;
}
