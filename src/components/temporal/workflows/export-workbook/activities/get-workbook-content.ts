import {getCtxRequestIdWithFallback} from '../../../../../utils/ctx';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';

export type GetWorkbookContentArgs = {
    workbookId: string;
};

type GetWorkbookContentResult = {
    connections: string[];
    datasets: string[];
    charts: string[];
    dashboards: string[];
    reports: string[];
};

export const getWorkbookContent = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workbookId}: GetWorkbookContentArgs,
): Promise<GetWorkbookContentResult> => {
    const connections: string[] = [];
    const datasets: string[] = [];
    const charts: string[] = [];
    const dashboards: string[] = [];
    const reports: string[] = [];

    let page: number | undefined = 0;

    while (typeof page === 'number') {
        const {responseData} = await gatewayApi.us._getWorkbookContent({
            ctx,
            headers: {},
            authArgs: {},
            requestId: getCtxRequestIdWithFallback(ctx),
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
                case EntryScope.Report:
                    reports.push(entry.entryId);
                    break;
                default:
                    break;
            }
        });

        page = nextPageToken ? Number(nextPageToken) : undefined;
    }

    return {connections, datasets, charts, dashboards, reports};
};
