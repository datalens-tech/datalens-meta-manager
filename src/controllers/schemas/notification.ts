import {z} from '../../components/zod';

export const notificationSchema = z.object({
    code: z.string(),
    message: z.string(),
    level: z.string(),
});

export const entryNotificationSchema = z.object({
    entryId: z.string(),
    notifications: z.array(notificationSchema),
});
