import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
import {AppError} from '@gravity-ui/nodekit';
import {ZodError, ZodTypeAny, z} from 'zod';

import {META_MANAGER_ERROR} from '../../constants';

import * as zc from './custom-types';

extendZodWithOpenApi(z);

const prepareError = (error: unknown): Error => {
    if (error instanceof ZodError) {
        return new AppError('Validation error', {
            code: META_MANAGER_ERROR.VALIDATION_ERROR,
            details: error.issues,
        });
    } else {
        return error as Error;
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
        } catch (error) {
            throw prepareError(error);
        }
    };

export {z};
export {zc};
