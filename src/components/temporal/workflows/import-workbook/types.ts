export type ImportWorkbookArgs = {
    workbookId: string;
    importId: string;
    tenantId?: string;
};

export type ImportWorkbookResult = {
    importId: string;
};
