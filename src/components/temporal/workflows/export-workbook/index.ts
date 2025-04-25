import {
    ActivityFailure,
    ApplicationFailure,
    CancellationScope,
    defineQuery,
    proxyActivities,
    setHandler,
} from '@temporalio/workflow';
import pLimit from 'p-limit';

import type {createActivities} from './activities';
import type {ExportWorkbookArgs, ExportWorkbookResult} from './types';

export const getWorkbookExportProgress = defineQuery<number, []>('getProgress');

const EXPORT_REQUESTS_CONCURRENCY = 20;

const limit = pLimit(EXPORT_REQUESTS_CONCURRENCY);

const {finishExportSuccess, finishExportError, getWorkbookContent, exportEntry} = proxyActivities<
    ReturnType<typeof createActivities>
>({
    retry: {
        initialInterval: '1 sec',
        maximumInterval: '20 sec',
        backoffCoefficient: 3,
        maximumAttempts: 5,
    },
    startToCloseTimeout: '20 sec',
});

export const exportWorkbook = async (
    workflowArgs: ExportWorkbookArgs,
): Promise<ExportWorkbookResult> => {
    const {exportId} = workflowArgs;

    let entriesCount = 0;
    let processedEntriesCount = 0;

    setHandler(getWorkbookExportProgress, (): number => {
        return entriesCount > 0 ? Math.floor((processedEntriesCount * 100) / entriesCount) : 0;
    });

    try {
        const entries = await getWorkbookContent({
            workflowArgs,
        });

        entriesCount = entries.length;

        const idMapping = entries.reduce<Record<string, string>>((acc, {entryId}, index) => {
            acc[entryId] = String(index);

            return acc;
        }, {});

        const exportEntryPromises = entries.map(({entryId, scope}) =>
            limit(async () => {
                await exportEntry({
                    workflowArgs,
                    entryId,
                    scope,
                    idMapping,
                });

                processedEntriesCount++;
            }),
        );

        await Promise.all(exportEntryPromises);

        await finishExportSuccess({workflowArgs});
    } catch (error) {
        let failureType: string | undefined;

        if (error instanceof ActivityFailure && error.cause instanceof ApplicationFailure) {
            failureType = error.cause.type || undefined;
        }

        await CancellationScope.nonCancellable(() =>
            finishExportError({workflowArgs, failureType}),
        );

        throw error;
    }

    return {exportId};
};
