export enum WorkbookPermission {
    ListAccessBindings = 'listAccessBindings',
    UpdateAccessBindings = 'updateAccessBindings',
    LimitedView = 'limitedView',
    View = 'view',
    Update = 'update',
    Copy = 'copy',
    Move = 'move',
    Publish = 'publish',
    Embed = 'embed',
    Delete = 'delete',
}

export enum WorkbookStatus {
    Importing = 'importing',
}

export type WorkbookPermissions = Record<WorkbookPermission, boolean>;

export type Workbook = {
    workbookId: string;
    collectionId: string | null;
    title: string;
    description: string | null;
    tenantId: string;
    projectId: string | null;
    meta: Record<string, unknown>;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
};
