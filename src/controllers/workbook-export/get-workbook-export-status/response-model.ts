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
}: GetWorkbookExportStatusResult): z.infer<typeof schema> => {
    return {
        exportId: encodeId(exportId),
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

export const responseModel = {
    schema,
    format,
};
