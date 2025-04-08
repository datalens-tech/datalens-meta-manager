import {exportWorkbook} from '../../workflows/export-workbook';
import {EXPORT_WORKBOOK_QUEUE_NAME} from '../../workflows/export-workbook/constants';
import {importWorkbook} from '../../workflows/import-workbook';
import {IMPORT_WORKBOOK_QUEUE_NAME} from '../../workflows/import-workbook/constants';
import {getClient} from '../client';

export const startExportWorkbookWorkflow = async ({
    exportId,
    workbookId,
    tenantId,
}: {
    exportId: string;
    workbookId: string;
    tenantId?: string;
}) => {
    const client = await getClient();

    await client.workflow.start(exportWorkbook, {
        args: [{exportId, workbookId, tenantId}],
        taskQueue: EXPORT_WORKBOOK_QUEUE_NAME,
        workflowId: exportId,
    });
};

export const startImportWorkbookWorkflow = async ({
    importId,
    workbookId,
    tenantId,
}: {
    importId: string;
    workbookId: string;
    tenantId?: string;
}) => {
    const client = await getClient();

    await client.workflow.start(importWorkbook, {
        args: [{importId, workbookId, tenantId}],
        taskQueue: IMPORT_WORKBOOK_QUEUE_NAME,
        workflowId: importId,
    });
};
