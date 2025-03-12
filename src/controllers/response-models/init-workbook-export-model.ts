import {z} from '../../components/zod';
import {ExportModel} from '../../db/models';

const schema = z
    .object({
        exportId: z.string(),
    })
    .describe('Init workbook export result');

type InitWorkbookExportModel = z.infer<typeof schema>;

const format = (workbookExport: ExportModel): InitWorkbookExportModel => {
    return {
        exportId: workbookExport.exportId,
    };
};

export const initWorkbookExportModel = {
    schema,
    format,
};
