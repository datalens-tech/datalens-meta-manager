import {z} from '../../../components/zod';
import type {CancelWorkbookExportResult} from '../../../services/export';

const schema = z
    .object({
        exportId: z.string(),
    })
    .describe('Cancel workbook export result');

type CancelWorkbookExportModel = z.infer<typeof schema>;

const format = ({exportId}: CancelWorkbookExportResult): CancelWorkbookExportModel => {
    return {
        exportId,
    };
};

export const cancelWorkbookExportModel = {
    schema,
    format,
};
