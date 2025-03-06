import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
import {AppError} from '@gravity-ui/nodekit';
import {ZodError, ZodTypeAny, z} from 'zod';

import {TRANSFER_ERROR} from '../../constants';

extendZodWithOpenApi(z);

const prepareError = (err: unknown): Error => {
    if (err instanceof ZodError) {
        return new AppError('Validation error', {
            code: TRANSFER_ERROR.VALIDATION_ERROR,
            details: err.issues,
        });
    } else {
        return err as Error;
    }
};

type MakeReqParserArgs<P, Q, B> = {
    params?: P extends ZodTypeAny ? P : undefined;
    query?: Q extends ZodTypeAny ? Q : undefined;
    body?: B extends ZodTypeAny ? B : undefined;
};

type ReqParseArgs<P, Q, B> = {
    params?: P extends ZodTypeAny ? Object : unknown;
    query?: Q extends ZodTypeAny ? Object : unknown;
    body?: B extends ZodTypeAny ? Object : unknown;
};

type ReqParseResult<P, Q, B> = {
    params: P extends ZodTypeAny ? z.infer<P> : undefined;
    query: Q extends ZodTypeAny ? z.infer<Q> : undefined;
    body: B extends ZodTypeAny ? z.infer<B> : undefined;
};

export const makeReqParser =
    <P, Q, B>({
        params: paramsSchema,
        query: querySchema,
        body: bodySchema,
    }: MakeReqParserArgs<P, Q, B>) =>
    async ({
        params: paramsData,
        query: queryData,
        body: bodyData,
    }: ReqParseArgs<P, Q, B>): Promise<ReqParseResult<P, Q, B>> | never => {
        try {
            const paramsPromise =
                typeof paramsSchema === 'undefined'
                    ? Promise.resolve(undefined)
                    : paramsSchema.parseAsync(paramsData);
            const queryPromise =
                typeof querySchema === 'undefined'
                    ? Promise.resolve(undefined)
                    : querySchema.parseAsync(queryData);
            const bodyPromise =
                typeof bodySchema === 'undefined'
                    ? Promise.resolve(undefined)
                    : bodySchema.parseAsync(bodyData);

            const [params, query, body] = await Promise.all([
                paramsPromise,
                queryPromise,
                bodyPromise,
            ]);

            return {params, query, body};
        } catch (err) {
            throw prepareError(err);
        }
    };

export {z};
