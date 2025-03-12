import {z} from '../../../components/zod';
import {ExportModel} from '../../../db/models';

const schema = z
    .object({
        exportId: z.string(),
    })
    .describe('Start workbook export result');

type StartWorkbookExportModel = z.infer<typeof schema>;

const format = (workbookExport: ExportModel): StartWorkbookExportModel => {
    return {
        exportId: workbookExport.exportId,
    };
};

export const startWorkbookExportModel = {
    schema,
    format,
};
