import {EntryScope} from '../../components/gateway/schema/us/types/entry';
import {z} from '../../components/zod';

export const entryNotificationSchema = z.object({
    entryId: z.string().optional(),
    scope: z.nativeEnum(EntryScope).optional(),
    code: z.string(),
    message: z.string(),
    level: z.string(),
});
