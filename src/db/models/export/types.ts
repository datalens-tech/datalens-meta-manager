import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {NotificationLevel} from '../../../types/models';

type EntryId = string;

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

export type ExportNotifications = ExportEntryNotifications[];
