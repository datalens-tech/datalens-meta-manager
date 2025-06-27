import {z} from '../../../components/zod';
import {ExportModel} from '../../../db/models';
import {encodeId} from '../../../utils';

const schema = z
    .object({
        exportId: z.string(),
    })
    .describe('Start workbook export result');

type StartWorkbookExportModel = z.infer<typeof schema>;

const format = (workbookExport: ExportModel): StartWorkbookExportModel => {
    return {
        exportId: encodeId(workbookExport.exportId),
    };
};

export const responseModel = {
    schema,
    format,
};
