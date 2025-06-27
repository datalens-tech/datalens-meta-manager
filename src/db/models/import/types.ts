import {EntryScope} from '../../../components/gateway/schema/us/types/entry';
import {NotificationLevel} from '../../../types/models';

export enum ImportStatus {
    Pending = 'pending',
    Success = 'success',
    Error = 'error',
}
type EntryId = string;

export type ImportNotification = {
    code: string;
    message?: string;
    level: NotificationLevel;
    details?: Record<string, unknown>;
};

export type ImportEntryNotifications = {
    entryId?: EntryId;
    scope?: EntryScope;
    notifications: ImportNotification[];
};

export type ImportMeta = {
    workbookId: string;
};

export type ImportNotifications = ImportEntryNotifications[];
