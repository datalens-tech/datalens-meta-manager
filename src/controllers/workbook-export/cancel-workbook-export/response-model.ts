import {z} from '../../../components/zod';
import type {CancelWorkbookExportResult} from '../../../services/export';
import {encodeId} from '../../../utils';

const schema = z
    .object({
        exportId: z.string(),
    })
    .describe('Cancel workbook export result');

const format = ({exportId}: CancelWorkbookExportResult): z.infer<typeof schema> => {
    return {
        exportId: encodeId(exportId),
    };
};

export const responseModel = {
    schema,
    format,
};
