import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import {makeTenantIdHeader} from '../../../../us/utils';
import type {ActivitiesDeps} from '../../../types';
import {prepareGatewayRestError} from '../../utils';
import {ExportWorkbookArgs} from '../types';

export type GetWorkbookContentArgs = {
    workflowArgs: ExportWorkbookArgs;
};

type GetWorkbookContentResult = Array<{entryId: string; scope: EntryScope}>;

export const getWorkbookContent = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workflowArgs}: GetWorkbookContentArgs,
): Promise<GetWorkbookContentResult> => {
    const {workbookId, tenantId, requestId} = workflowArgs;

    const resultEntries: GetWorkbookContentResult = [];

    let page: number | undefined = 0;

    while (typeof page === 'number') {
        let data;

        try {
            data = await gatewayApi.us._getWorkbookContent({
                ctx,
                headers: {
                    ...makeTenantIdHeader(tenantId),
                },
                requestId,
                args: {workbookId, page},
            });
        } catch (error: unknown) {
            throw prepareGatewayRestError(error);
        }

        const {
            responseData: {entries, nextPageToken},
        } = data;

        for (const entry of entries) {
            resultEntries.push({entryId: entry.entryId, scope: entry.scope});
        }

        page = nextPageToken ? Number(nextPageToken) : undefined;
    }

    return resultEntries;
};
