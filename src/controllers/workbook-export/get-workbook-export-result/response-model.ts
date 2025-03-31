import {z} from '../../../components/zod';
import {ExportStatus} from '../../../db/models';
import {GetWorkbookExportResult} from '../../../services/export';
import {encodeId} from '../../../utils';

const schema = z
    .object({
        exportId: z.string(),
        data: z.record(z.string(), z.unknown()),
        status: z.nativeEnum(ExportStatus),
    })
    .describe('Get workbook export result');

const format = (workbookExport: GetWorkbookExportResult): z.infer<typeof schema> => {
    return {
        exportId: encodeId(workbookExport.exportId),
        status: workbookExport.status,
        data: workbookExport.data,
    };
};

export const responseModel = {
    schema,
    format,
};
