import type {Entry} from './entry';
import type {Workbook, WorkbookPermissions, WorkbookStatus} from './workbook';

export type GetWorkbookParams = {
    workbookId: string;
    includePermissionsInfo?: boolean;
};

export type GetWorkbookResponse = Workbook & {
    permissions?: WorkbookPermissions;
};

export type CreateWorkbookParams = {
    title: string;
    collectionId?: string | null;
    description?: string;
    status?: WorkbookStatus;
};

export type CreateWorkbookResponse = Workbook;

export type UpdateWorkbookParams = {
    workbookId: string;
    title?: string;
    description?: string;
    status?: WorkbookStatus;
    meta?: Record<string, unknown>;
};

export type UpdateWorkbookResponse = Workbook;

export type GetWorkbookContentParams = {
    workbookId: string;
    page: number;
};

export type GetWorkbookContentResponse = {
    entries: Entry[];
    nextPageToken?: string;
};

export type DeleteWorkbookParams = {
    workbookId: string;
};

export type DeleteWorkbookResponse = Workbook;
