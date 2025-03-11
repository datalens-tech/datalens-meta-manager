import {exportWorkbook} from '../workflows/export-workbook';
import {EXPORT_WORKBOOK_QUEUE_NAME} from '../workflows/export-workbook/constants';

import {getClient} from './client';

export {getClient};

export const startExportWorkbook = async ({
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
