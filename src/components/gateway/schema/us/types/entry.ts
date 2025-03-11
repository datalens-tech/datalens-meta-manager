export enum EntryScope {
    Connection = 'connection',
    Dataset = 'dataset',
    Widget = 'widget',
    Dash = 'dash',
    Folder = 'folder',
    Config = 'config',
    Pdf = 'pdf',
    Report = 'report',
}

export type Entry = {
    entryId: string;
    workbookId: string;
    scope: EntryScope;
    type: string;
    createdAt: string;
    createdBy: string;
    data: Record<string, unknown> | null;
    hidden: boolean;
    mirrored?: boolean;
    key: string;
    meta: Record<string, unknown> | null;
    public: boolean;
    publishedId: string | null;
    revId: string;
    savedId: string;
    tenantId: string;
    updatedAt: string;
    updatedBy: string;
    unversionedData?: unknown;
};
