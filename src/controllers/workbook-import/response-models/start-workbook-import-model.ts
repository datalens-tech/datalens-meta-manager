import {z} from '../../../components/zod';
import type {StartWorkbookImportResult} from '../../../services/import';

const schema = z
    .object({
        importId: z.string(),
        workbookId: z.string(),
    })
    .describe('Start workbook import result');

type StartWorkbookImportModel = z.infer<typeof schema>;

const format = ({
    workbookImport,
    workbookId,
}: StartWorkbookImportResult): StartWorkbookImportModel => {
    return {
        importId: workbookImport.importId,
        workbookId,
    };
};

export const startWorkbookImportModel = {
    schema,
    format,
};
