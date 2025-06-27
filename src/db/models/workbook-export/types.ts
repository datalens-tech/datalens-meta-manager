import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {NotificationLevel} from '../../../types/models';

import {WORKBOOK_EXPORT_DATA_ENTRIES_FIELD} from './constants';

type EntryId = string;
type MockEntryId = string;

export type WorkbookExportNotification = {
    code: string;
    message?: string;
    level: NotificationLevel;
    details?: Record<string, unknown>;
};

export type WorkbookExportEntryNotifications = {
    entryId?: EntryId;
    scope?: EntryScope;
    notifications: WorkbookExportNotification[];
};

export type WorkbookExportMeta = {
    version: string;
    sourceWorkbookId: string;
};

export type WorkbookExportEntriesData = Record<MockEntryId, unknown>;

export type WorkbookExportData = {
    version: string;
    [WORKBOOK_EXPORT_DATA_ENTRIES_FIELD]: {
        [key in EntryScope]?: WorkbookExportEntriesData;
    };
};

export type WorkbookExportNotifications = WorkbookExportEntryNotifications[];
