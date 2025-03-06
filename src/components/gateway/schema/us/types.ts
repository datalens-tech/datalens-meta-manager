export type GetWorkbookParams = {
    workbookId: string;
};

export type GetWorkbookResponse = {
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

export type CreateWorkbookParams = {
    title: string;
    collectionId?: string | null;
    description?: string;
};

export type CreateWorkbookResponse = {
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
