import {z} from '../../../components/zod';
import {ExportStatus} from '../../../db/models';
import {GetWorkbookExportStatusResult} from '../../../services/export';
import {entryNotificationSchema} from '../../schemas/notification';

const schema = z
    .object({
        exportId: z.string(),
        status: z.nativeEnum(ExportStatus),
        progress: z.number(),
        errors: z
            .object({
                criticalNotifications: z.array(entryNotificationSchema).optional(),
            })
            .nullable(),
        notifications: z
            .object({
                connections: z.array(entryNotificationSchema).optional(),
                datasets: z.array(entryNotificationSchema).optional(),
            })
            .nullable(),
    })
    .describe('Workbook export status');

type WorkbookExportStatusModel = z.infer<typeof schema>;

const format = ({
    exportId,
    status,
    progress,
    errors,
    notifications,
}: GetWorkbookExportStatusResult): WorkbookExportStatusModel => {
    return {
        exportId,
        status,
        errors,
        notifications,
        progress,
    };
};

export const workbookExportStatusModel = {
    schema,
    format,
};
