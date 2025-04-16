export type ExportWorkbookArgs = {
    workbookId: string;
    exportId: string;
    tenantId?: string;
    requestId: string;
};

export type ExportWorkbookResult = {
    exportId: string;
};
