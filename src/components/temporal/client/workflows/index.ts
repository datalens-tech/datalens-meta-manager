import {BigIntId} from '../../../../types';
import {encodeId} from '../../../../utils';
import {exportWorkbook} from '../../workflows/export-workbook';
import {EXPORT_WORKBOOK_QUEUE_NAME} from '../../workflows/export-workbook/constants';
import {importWorkbook} from '../../workflows/import-workbook';
import {IMPORT_WORKBOOK_QUEUE_NAME} from '../../workflows/import-workbook/constants';
import {getClient} from '../client';

export const startExportWorkbookWorkflow = async ({
    exportId,
    workbookId,
    tenantId,
    requestId,
}: {
    exportId: BigIntId;
    workbookId: string;
    tenantId?: string;
    requestId: string;
}) => {
    const client = await getClient();

    const encodedExportId = encodeId(exportId);

    await client.workflow.start(exportWorkbook, {
        args: [{exportId, workbookId, tenantId, requestId}],
        taskQueue: EXPORT_WORKBOOK_QUEUE_NAME,
        workflowId: encodedExportId,
    });
};

export const startImportWorkbookWorkflow = async ({
    importId,
    workbookId,
    tenantId,
    requestId,
}: {
    importId: BigIntId;
    workbookId: string;
    tenantId?: string;
    requestId: string;
}) => {
    const client = await getClient();

    const encodedImportId = encodeId(importId);

    await client.workflow.start(importWorkbook, {
        args: [{importId, workbookId, tenantId, requestId}],
        taskQueue: IMPORT_WORKBOOK_QUEUE_NAME,
        workflowId: encodedImportId,
    });
};
