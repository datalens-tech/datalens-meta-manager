import {exportWorkbook} from '../workflows/export-workbook';
import {EXPORT_WORKBOOK_QUEUE_NAME} from '../workflows/export-workbook/constants';
import {importWorkbook} from '../workflows/import-workbook';
import {IMPORT_WORKBOOK_QUEUE_NAME} from '../workflows/import-workbook/constants';

import {getClient} from './client';

export {getClient};

export const startExportWorkbookWorkflow = async ({
    exportId,
    workbookId,
}: {
    exportId: string;
    workbookId: string;
}) => {
    const client = await getClient();

    await client.workflow.start(exportWorkbook, {
        args: [{exportId, workbookId}],
        taskQueue: EXPORT_WORKBOOK_QUEUE_NAME,
        workflowId: exportId,
    });
};

export const startImportWorkbookWorkflow = async ({
    importId,
    workbookId,
}: {
    importId: string;
    workbookId: string;
}) => {
    const client = await getClient();

    await client.workflow.start(importWorkbook, {
        args: [{importId, workbookId}],
        taskQueue: IMPORT_WORKBOOK_QUEUE_NAME,
        workflowId: importId,
    });
};
