export type ImportWorkbookArgs = {
    workbookId: string;
    importId: string;
    tenantId?: string;
    requestId: string;
};

export type ImportWorkbookResult = {
    importId: string;
};
