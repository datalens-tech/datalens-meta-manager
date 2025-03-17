import {z} from '../../../components/zod';
import {ExportStatus, WorkbookExportModel} from '../../../db/models';

const schema = z
    .object({
        exportId: z.string(),
        data: z.record(z.string(), z.unknown()),
        status: z.nativeEnum(ExportStatus),
    })
    .describe('Workbook export');

type WorkbookExportResponseModel = z.infer<typeof schema>;

const format = (workbookExport: WorkbookExportModel): WorkbookExportResponseModel => {
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
