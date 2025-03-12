import {z} from '../../components/zod';
import {ExportStatus} from '../../db/models';
import {GetWorkbookExportStatusResult} from '../../services/export';

const schema = z
    .object({
        exportId: z.string(),
        status: z.nativeEnum(ExportStatus),
        progress: z.number(),
    })
    .describe('Workbook export status');

type WorkbookExportStatusModel = z.infer<typeof schema>;

const format = ({
    exportId,
    status,
    progress,
}: GetWorkbookExportStatusResult): WorkbookExportStatusModel => {
    return {
        exportId,
        status,
        progress,
    };
};

export const workbookExportStatusModel = {
    schema,
    format,
};
