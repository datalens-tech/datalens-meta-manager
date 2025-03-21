import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {NotificationLevel} from '../../../types/models';

type EntryId = string;

type WorkbookImportNotification = {
    code: string;
    message: string;
    level: NotificationLevel;
};

export type WorkbookImportEntryNotifications = {
    entryId?: EntryId;
    scope?: EntryScope;
    notifications: WorkbookImportNotification[];
};

export type WorkbookImportMeta = {
    workbookId: string;
};

export type WorkbookImportNotifications = WorkbookImportEntryNotifications[];
