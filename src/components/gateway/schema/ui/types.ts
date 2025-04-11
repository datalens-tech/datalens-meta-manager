import {EntryScope} from '../us/types/entry';

export enum NotificationLevel {
    Info = 'info',
    Warning = 'warning',
    Critical = 'critical',
}

export type Notification = {
    code: string;
    message?: string;
    level: NotificationLevel;
};

export type ExportParams = {
    exportId: string;
    scope: EntryScope;
    idMapping: Record<string, string>;
    workbookId: string;
};

export type ExportResponse = {
    connection: unknown;
    notifications: Notification[];
    entryData: Record<string, unknown> | null;
};

export type ImportParams = {
    idMapping: Record<string, string>;
    entryData: Record<string, unknown>;
    workbookId: string;
};

export type ImportResponse = {
    id: string;
    notifications: Notification[];
};
