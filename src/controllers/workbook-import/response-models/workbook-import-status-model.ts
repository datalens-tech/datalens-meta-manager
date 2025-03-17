import {z} from '../../../components/zod';
import {ImportStatus} from '../../../db/models';
import {GetWorkbookImportStatusResult} from '../../../services/import';
import {notificationSchema} from '../../schemas/notification';

const schema = z
    .object({
        importId: z.string(),
        status: z.nativeEnum(ImportStatus),
        progress: z.number(),
        errors: z
            .object({
                criticalNotifications: z.array(notificationSchema).optional(),
            })
            .nullable(),
    })
    .describe('Workbook import status');

type WorkbookImportStatusModel = z.infer<typeof schema>;

const format = ({
    importId,
    status,
    progress,
    errors,
}: GetWorkbookImportStatusResult): WorkbookImportStatusModel => {
    return {
        importId,
        status,
        progress,
        errors,
    };
};

export const workbookImportStatusModel = {
    schema,
    format,
};
