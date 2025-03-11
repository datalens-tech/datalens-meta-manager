import {z} from '../../components/zod';
import {ExportModel} from '../../db/models';

const schema = z
    .object({
        exportId: z.string(),
    })
    .describe('Workbook export');

type ExportWorkbookModel = z.infer<typeof schema>;

const format = (workbookExport: ExportModel): ExportWorkbookModel => {
    return {
        exportId: workbookExport.exportId,
    };
};

export const exportWorkbookModel = {
    schema,
    format,
};
