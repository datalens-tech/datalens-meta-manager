export enum NotificationLevel {
    Info = 'info',
    Warning = 'warning',
    Critical = 'critical',
}

export type Notification = {
    code: string;
    message: string;
    level: NotificationLevel;
};

export type ExportConnectionParams = {
    connectionId: string;
};

export type ExportConnectionResponse = {
    connection: unknown;
    notifications: Notification[];
};

export type ImportConnectionParams = {
    data: {
        workbookId: string;
        connection: unknown;
    };
};

export type ImportConnectionResponse = {
    id: string;
    notifications: Notification[];
};

export type ExportDatasetParams = {
    datasetId: string;
    idMapping: Record<string, string>;
};

export type ExportDatasetResponse = {
    dataset: unknown;
    notifications: Notification[];
};

export type ImportDatasetParams = {
    data: {
        workbookId: string;
        dataset: unknown;
    };
    idMapping: Record<string, string>;
};

export type ImportDatasetResponse = {
    id: string;
    notifications: Notification[];
};
