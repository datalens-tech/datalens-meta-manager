import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import {makeTenantIdHeader} from '../../../../us/utils';
import type {ActivitiesDeps} from '../../../types';
import {ExportWorkbookArgs} from '../types';

export type GetWorkbookContentArgs = {
    workflowArgs: ExportWorkbookArgs;
};

type GetWorkbookContentResult = {
    connections: string[];
    datasets: string[];
    charts: string[];
    dashboards: string[];
};

export const getWorkbookContent = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workflowArgs}: GetWorkbookContentArgs,
): Promise<GetWorkbookContentResult> => {
    const {workbookId, tenantId, requestId} = workflowArgs;

    const connections: string[] = [];
    const datasets: string[] = [];
    const charts: string[] = [];
    const dashboards: string[] = [];

    let page: number | undefined = 0;

    while (typeof page === 'number') {
        const {responseData} = await gatewayApi.us._getWorkbookContent({
            ctx,
            headers: {
                ...makeTenantIdHeader(tenantId),
            },
            requestId,
            args: {workbookId, page},
        });

        const {entries, nextPageToken} = responseData;

        entries.forEach((entry) => {
            switch (entry.scope) {
                case EntryScope.Connection:
                    connections.push(entry.entryId);
                    break;
                case EntryScope.Dataset:
                    datasets.push(entry.entryId);
                    break;
                case EntryScope.Widget:
                    charts.push(entry.entryId);
                    break;
                case EntryScope.Dash:
                    dashboards.push(entry.entryId);
                    break;
                default:
                    break;
            }
        });

        page = nextPageToken ? Number(nextPageToken) : undefined;
    }

    return {connections, datasets, charts, dashboards};
};
