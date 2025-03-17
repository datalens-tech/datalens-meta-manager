import {z} from '../../../components/zod';
import {WorkbookImportModel} from '../../../db/models';

const schema = z
    .object({
        importId: z.string(),
    })
    .describe('Start workbook import result');

type StartWorkbookImportModel = z.infer<typeof schema>;

const format = (workbookImport: WorkbookImportModel): StartWorkbookImportModel => {
    return {
        importId: workbookImport.importId,
    };
};

export const startWorkbookImportModel = {
    schema,
    format,
};
