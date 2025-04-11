import {z} from '..';
import {WorkbookExportDataWithHash} from '../../../types/workbook-export';
import {EntryScope} from '../../gateway/schema/us/types/entry';

export const entryNotificationSchema = z.object({
    entryId: z.string().optional(),
    scope: z.nativeEnum(EntryScope).optional(),
    code: z.string(),
    message: z.string().optional(),
    level: z.string(),
});

export const workbookExportDataWithHashSchema: z.ZodType<WorkbookExportDataWithHash> = z
    .object({
        hash: z.string(),
        export: z.object({
            version: z.string(),
            connections: z.record(z.string(), z.unknown()).optional(),
            datasets: z.record(z.string(), z.unknown()).optional(),
        }),
    })
    .passthrough();
