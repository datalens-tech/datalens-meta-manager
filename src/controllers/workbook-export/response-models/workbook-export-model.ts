import {z} from '../../../components/zod';
import {ExportModel, ExportStatus} from '../../../db/models';

const schema = z
    .object({
        exportId: z.string(),
        data: z.record(z.string(), z.unknown()),
        status: z.nativeEnum(ExportStatus),
    })
    .describe('Workbook export');

type WorkbookExportModel = z.infer<typeof schema>;

const format = (workbookExport: ExportModel): WorkbookExportModel => {
    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        data: workbookExport.data,
    };
};

export const workbookExportModel = {
    schema,
    format,
};
