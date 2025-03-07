import {exportWorkbook} from '../workflows/export-workbook';
import {EXPORT_WORKBOOK_QUEUE_NAME} from '../workflows/export-workbook/constants';

import {getClient} from './get-client';

export const startExportWorkbook = async ({
    exportId,
    workbookId,
}: {
    exportId: string;
    workbookId: string;
}) => {
    const client = await getClient();

    const handle = await client.start(exportWorkbook, {
        args: [{workbookId}],
        taskQueue: EXPORT_WORKBOOK_QUEUE_NAME,
        workflowId: exportId,
    });

    console.log(`Started Workflow ${handle.workflowId} with RunID ${handle.firstExecutionRunId}`);
    // console.log(await handle.result());
};
