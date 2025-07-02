import {z} from '../../../components/zod';
import {entryNotificationSchema} from '../../../components/zod/schemas/workbook-transfer';
import {ExportStatus} from '../../../db/models';
import {GetWorkbookExportStatusResult} from '../../../services/export';
import {encodeId} from '../../../utils';

const schema = z
    .object({
        exportId: z.string(),
        status: z.nativeEnum(ExportStatus),
        progress: z.number(),
        notifications: z.array(entryNotificationSchema).nullable().optional(),
    })
    .describe('Workbook export status');

const format = ({
    exportId,
    status,
    progress,
    notifications,
    entries,
}: GetWorkbookExportStatusResult): z.infer<typeof schema> => {
    const exportNotifications =
        notifications?.flatMap((item) =>
            item.notifications.map((notification) => ({
                entryId: item.entryId,
                scope: item.scope,
                code: notification.code,
                message: notification.message,
                level: notification.level,
                details: notification.details,
            })),
        ) || [];

    const entriesNotifications =
        entries?.flatMap(
            (entry) =>
                entry.notifications?.map((notification) => ({
                    entryId: entry.entryId,
                    scope: entry.scope,
                    code: notification.code,
                    message: notification.message,
                    level: notification.level,
                    details: notification.details,
                })) || [],
        ) || [];

    return {
        exportId: encodeId(exportId),
        status,
        notifications: [...exportNotifications, ...entriesNotifications],
        progress,
    };
};

export const responseModel = {
    schema,
    format,
};
