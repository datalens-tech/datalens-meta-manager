export type ExportWorkbookArgs = {
    workbookId: string;
    exportId: string;
    tenantId?: string;
};

export type ExportWorkbookResult = {
    exportId: string;
};
