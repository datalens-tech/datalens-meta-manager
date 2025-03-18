import {z} from '../../../components/zod';
import {ImportStatus} from '../../../db/models';
import {GetWorkbookImportStatusResult} from '../../../services/import';
import {entryNotificationSchema, notificationSchema} from '../../schemas/notification';

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
        notifications: z
            .object({
                connections: z.array(entryNotificationSchema).optional(),
                datasets: z.array(entryNotificationSchema).optional(),
            })
            .nullable(),
    })
    .describe('Workbook import status');

type WorkbookImportStatusModel = z.infer<typeof schema>;

const format = ({
    importId,
    status,
    errors,
    notifications,
    progress,
}: GetWorkbookImportStatusResult): WorkbookImportStatusModel => {
    return {
        importId,
        status,
        errors,
        notifications,
        progress,
    };
};

export const workbookImportStatusModel = {
    schema,
    format,
};
