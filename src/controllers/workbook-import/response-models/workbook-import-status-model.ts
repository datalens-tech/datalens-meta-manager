import {z} from '../../../components/zod';
import {ImportStatus} from '../../../db/models';
import {GetWorkbookImportStatusResult} from '../../../services/import';

const schema = z
    .object({
        importId: z.string(),
        status: z.nativeEnum(ImportStatus),
        progress: z.number(),
        error: z.record(z.string(), z.unknown()).nullable(),
    })
    .describe('Workbook import status');

type WorkbookImportStatusModel = z.infer<typeof schema>;

const format = ({
    importId,
    status,
    progress,
    error,
}: GetWorkbookImportStatusResult): WorkbookImportStatusModel => {
    return {
        importId,
        status,
        progress,
        error,
    };
};

export const workbookImportStatusModel = {
    schema,
    format,
};
