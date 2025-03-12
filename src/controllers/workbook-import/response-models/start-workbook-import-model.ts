import {z} from '../../../components/zod';
import {ImportModel} from '../../../db/models';

const schema = z
    .object({
        importId: z.string(),
    })
    .describe('Start workbook import result');

type StartWorkbookImportModel = z.infer<typeof schema>;

const format = (workbookImport: ImportModel): StartWorkbookImportModel => {
    return {
        importId: workbookImport.importId,
    };
};

export const startWorkbookImportModel = {
    schema,
    format,
};
