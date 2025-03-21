import {z} from '../../../components/zod';
import {ExportStatus} from '../../../db/models';
import {GetWorkbookExportStatusResult} from '../../../services/export';
import {entryNotificationSchema} from '../../schemas/notification';

const schema = z
    .object({
        exportId: z.string(),
        status: z.nativeEnum(ExportStatus),
        progress: z.number(),
        notifications: z.array(entryNotificationSchema).nullable().optional(),
    })
    .describe('Workbook export status');

type WorkbookExportStatusModel = z.infer<typeof schema>;

const format = ({
    exportId,
    status,
    progress,
    notifications,
}: GetWorkbookExportStatusResult): WorkbookExportStatusModel => {
    return {
        exportId,
        status,
        notifications: notifications?.flatMap((entry) =>
            entry.notifications.map((notification) => ({
                entryId: entry.entryId,
                scope: entry.scope,
                code: notification.code,
                message: notification.message,
                level: notification.level,
            })),
        ),
        progress,
    };
};

export const workbookExportStatusModel = {
    schema,
    format,
};
