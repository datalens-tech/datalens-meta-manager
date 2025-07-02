import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {NotificationLevel} from '../../../types/models';

import {EXPORT_DATA_ENTRIES_FIELD} from './constants';

type EntryId = string;
type MockEntryId = string;

export enum ExportStatus {
    Pending = 'pending',
    Success = 'success',
    Error = 'error',
}

export type ExportNotification = {
    code: string;
    message?: string;
    level: NotificationLevel;
    details?: Record<string, unknown>;
};

export type ExportEntryNotifications = {
    entryId?: EntryId;
    scope?: EntryScope;
    notifications: ExportNotification[];
};

export type ExportMeta = {
    version: string;
    sourceWorkbookId: string;
};

export type ExportEntriesData = Record<MockEntryId, unknown>;

export type ExportData = {
    version: string;
    [EXPORT_DATA_ENTRIES_FIELD]: {
        [key in EntryScope]?: ExportEntriesData;
    };
};

export type ExportNotifications = ExportEntryNotifications[];
