import type {Notification} from '../../../components/gateway/schema/bi/types';

type EntryId = string;

export type WorkbookImportEntryNotifications = {
    entryId: EntryId;
    notifications: Notification[];
};

export type WorkbookImportMeta = {
    workbookId: string;
};

export type WorkbookImportErrors = {
    criticalNotifications?: Notification[];
};

export type WorkbookImportNotifications = {
    connections?: WorkbookImportEntryNotifications[];
    datasets?: WorkbookImportEntryNotifications[];
};
