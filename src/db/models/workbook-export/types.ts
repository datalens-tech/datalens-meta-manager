import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {NotificationLevel} from '../../../types/models';

type EntryId = string;
type MockEntryId = string;

type WorkbookExportNotification = {
    code: string;
    message?: string;
    level: NotificationLevel;
};

export type WorkbookExportEntryNotifications = {
    entryId?: EntryId;
    scope?: EntryScope;
    notifications: WorkbookExportNotification[];
};

export type WorkbookExportMeta = {
    sourceWorkbookId: string;
};

export type WorkbookExportEntriesData = Record<MockEntryId, unknown>;

export type WorkbookExportData = {
    version: string;
    entries: {
        [key in EntryScope]?: WorkbookExportEntriesData;
    };
};

export type WorkbookExportNotifications = WorkbookExportEntryNotifications[];
