import type {Notification} from '../../../components/gateway/schema/bi/types';

type EntryId = string;
type MockEntryId = string;

export type WorkbookExportEntryNotifications = {
    entryId: EntryId;
    notifications: Notification[];
};

export type WorkbookExportMeta = {
    sourceWorkbookId: string;
};

export type WorkbookExportEntriesData = Record<MockEntryId, unknown>;

export type WorkbookExportData = {
    version: string;
    connections?: WorkbookExportEntriesData;
    datasets?: WorkbookExportEntriesData;
};

export type WorkbookExportErrors = {
    criticalNotifications?: WorkbookExportEntryNotifications[];
};

export type WorkbookExportNotifications = {
    connections?: WorkbookExportEntryNotifications[];
    datasets?: WorkbookExportEntryNotifications[];
};
