import {z} from '../../../components/zod';
import type {CancelWorkbookImportResult} from '../../../services/import';

const schema = z
    .object({
        importId: z.string(),
    })
    .describe('Cancel workbook import result');

type CancelWorkbookImportModel = z.infer<typeof schema>;

const format = ({importId}: CancelWorkbookImportResult): CancelWorkbookImportModel => {
    return {
        importId,
    };
};

export const cancelWorkbookImportModel = {
    schema,
    format,
};
