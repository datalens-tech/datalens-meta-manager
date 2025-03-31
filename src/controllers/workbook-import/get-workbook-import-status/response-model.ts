import {z} from '../../../components/zod';
import {ImportStatus} from '../../../db/models';
import {GetWorkbookImportStatusResult} from '../../../services/import';
import {encodeId} from '../../../utils';
import {entryNotificationSchema} from '../../schemas/notification';

const schema = z
    .object({
        importId: z.string(),
        workbookId: z.string(),
        status: z.nativeEnum(ImportStatus),
        progress: z.number(),
        notifications: z.array(entryNotificationSchema).nullable().optional(),
    })
    .describe('Workbook import status');

type WorkbookImportStatusModel = z.infer<typeof schema>;

const format = ({
    importId,
    workbookId,
    status,
    notifications,
    progress,
}: GetWorkbookImportStatusResult): WorkbookImportStatusModel => {
    return {
        importId: encodeId(importId),
        workbookId,
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
