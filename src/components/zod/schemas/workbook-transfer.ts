import {z} from '..';
import {EntryScope} from '../../gateway/schema/us/types/entry';

export const entryNotificationSchema = z.object({
    entryId: z.string().optional(),
    scope: z.nativeEnum(EntryScope).optional(),
    code: z.string(),
    message: z.string().optional(),
    level: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
});
