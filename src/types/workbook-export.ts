import {EntryScope} from '../components/gateway/schema/us/types/entry';
import {EXPORT_DATA_ENTRIES_FIELD} from '../constants';

type MockEntryId = string;

export type ExportEntriesData = Record<MockEntryId, unknown>;

export type ExportData = {
    version: string;
    [EXPORT_DATA_ENTRIES_FIELD]: {
        [key in EntryScope]?: ExportEntriesData;
    };
};

export type WorkbookExportDataWithHash = {export: ExportData; hash: string};
