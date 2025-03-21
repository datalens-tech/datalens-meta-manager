import {z} from '../../../components/zod';
import {ExportStatus} from '../../../db/models';
import {GetWorkbookExportResult} from '../../../services/export';

const schema = z
    .object({
        exportId: z.string(),
        data: z.record(z.string(), z.unknown()),
        status: z.nativeEnum(ExportStatus),
    })
    .describe('Get workbook export result');

type WorkbookExportResultModel = z.infer<typeof schema>;

const format = (workbookExport: GetWorkbookExportResult): WorkbookExportResultModel => {
    return {
        exportId: workbookExport.exportId,
        status: workbookExport.status,
        data: workbookExport.data,
    };
};

export const getWorkbookExportResultModel = {
    schema,
    format,
};
