import {z} from 'zod';

import {StringId} from '../../../types';
import {decodeId} from '../../../utils/id';

export const makeIdDecoder = (ctx: z.RefinementCtx) => (val: string) => {
    try {
        return decodeId(val as StringId);
    } catch (err) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `id '${val}' has incorrect format`,
        });
        return z.NEVER;
    }
};
