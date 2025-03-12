import {z} from '../../../components/zod';
import {ExportStatus} from '../../../db/models';
import {GetWorkbookExportStatusResult} from '../../../services/export';

const schema = z
    .object({
        exportId: z.string(),
        status: z.nativeEnum(ExportStatus),
        progress: z.number(),
        error: z.record(z.string(), z.unknown()).nullable(),
    })
    .describe('Workbook export status');

type WorkbookExportStatusModel = z.infer<typeof schema>;

const format = ({
    exportId,
    status,
    progress,
    error,
}: GetWorkbookExportStatusResult): WorkbookExportStatusModel => {
    return {
        exportId,
        status,
        progress,
        error,
    };
};

export const workbookExportStatusModel = {
    schema,
    format,
};
