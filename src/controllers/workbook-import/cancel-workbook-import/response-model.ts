import {z} from '../../../components/zod';
import type {CancelWorkbookImportResult} from '../../../services/import';
import {encodeId} from '../../../utils';

const schema = z
    .object({
        importId: z.string(),
    })
    .describe('Cancel workbook import result');

type CancelWorkbookImportModel = z.infer<typeof schema>;

const format = ({importId}: CancelWorkbookImportResult): CancelWorkbookImportModel => {
    return {
        importId: encodeId(importId),
    };
};

export const responseModel = {
    schema,
    format,
};
