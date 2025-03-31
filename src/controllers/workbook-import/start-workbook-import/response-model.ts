import {z} from '../../../components/zod';
import type {StartWorkbookImportResult} from '../../../services/import';
import {encodeId} from '../../../utils';

const schema = z
    .object({
        importId: z.string(),
        workbookId: z.string(),
    })
    .describe('Start workbook import result');

type StartWorkbookImportModel = z.infer<typeof schema>;

const format = ({importId, workbookId}: StartWorkbookImportResult): StartWorkbookImportModel => {
    return {
        importId: encodeId(importId),
        workbookId,
    };
};

export const responseModel = {
    schema,
    format,
};
