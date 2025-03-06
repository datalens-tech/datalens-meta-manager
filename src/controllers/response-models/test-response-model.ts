import {z} from '../../components/zod';
import {ExportModel} from '../../db/models';

const schema = z
    .object({
        exportId: z.string(),
    })
    .describe('Test');

type TestResponseModel = z.infer<typeof schema>;

const format = (exportData: ExportModel): TestResponseModel => {
    return {
        exportId: exportData.exportId,
    };
};

export const test = {
    schema,
    format,
};
