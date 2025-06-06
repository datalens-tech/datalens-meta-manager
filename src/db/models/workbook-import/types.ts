import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {NotificationLevel} from '../../../types/models';

type EntryId = string;

export type WorkbookImportNotification = {
    code: string;
    message?: string;
    level: NotificationLevel;
    details?: Record<string, unknown>;
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
