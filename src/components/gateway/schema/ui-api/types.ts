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

export type ExportWorkbookEntryParams = {
    exportId: string;
    scope: EntryScope;
    idMapping: Record<string, string>;
    workbookId: string;
};

export type ExportWorkbookEntryResponse = {
    connection: unknown;
    notifications: Notification[];
    entryData: Record<string, unknown> | null;
};

export type ImportWorkbookEntryParams = {
    idMapping: Record<string, string>;
    entryData: Record<string, unknown>;
    workbookId: string;
};

export type ImportWorkbookEntryResponse = {
    id: string;
    notifications: Notification[];
};

export type GetWorkbooksTransferCapabilitiesResponse = {
    dependencies: Record<EntryScope, EntryScope[]>;
};
