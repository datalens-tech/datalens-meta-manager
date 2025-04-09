import {AppContext} from '@gravity-ui/nodekit';
import {NativeConnection, Worker} from '@temporalio/worker';

import {isTruthyEnvVariable} from '../../utils';

import {NAMESPACE} from './constants';
import {ActivitiesDeps} from './types';
import {createActivities as createClearExpiredActivities} from './workflows/clear-expired/activities';
import {CLEAR_EXPIRED_QUEUE_NAME} from './workflows/clear-expired/constants';
import {createActivities as createExportWorkbookActivities} from './workflows/export-workbook/activities';
import {EXPORT_WORKBOOK_QUEUE_NAME} from './workflows/export-workbook/constants';
import {createActivities as createImportWorkbookActivities} from './workflows/import-workbook/activities';
import {IMPORT_WORKBOOK_QUEUE_NAME} from './workflows/import-workbook/constants';

const WORKFLOWS_SOURCES = isTruthyEnvVariable('APP_DEV_MODE')
    ? {workflowsPath: require.resolve('./workflows')}
    : {
          workflowBundle: {
              codePath: require.resolve('../../../workflow-bundle.js'),
          },
      };

const DEFAULT_WORKERS_RESTARTS_COUNT = 3;

const runWorkerWithRestarts = async ({
    ctx,
    workerName,
    runWorkerFn,
    maxRestarts = DEFAULT_WORKERS_RESTARTS_COUNT,
}: {
    ctx: AppContext;
    workerName: string;
    runWorkerFn: () => Promise<void>;
    maxRestarts?: number;
}) => {
    let restarts = 0;

    const runWithRestart = async () => {
        try {
            ctx.log(`Starting ${workerName} worker (attempt ${restarts}/${maxRestarts})`);
            await runWorkerFn();
        } catch (error) {
            ctx.logError(`${workerName} worker failed:`, error);

            restarts++;

            if (restarts <= maxRestarts) {
                ctx.log(
                    `Restarting ${workerName} worker (${restarts}/${maxRestarts} restarts used).`,
                );
                await runWithRestart();
            } else {
                ctx.logError(`${workerName} worker failed after ${maxRestarts} restart attempts.`);

                throw error;
            }
        }
    };

    return runWithRestart();
};

export const initWorkers = async (deps: ActivitiesDeps) => {
    const connection = await NativeConnection.connect({address: process.env.TEMPORAL_ENDPOINT});

    const runExportWorkbookWorker = async () => {
        const worker = await Worker.create({
            ...WORKFLOWS_SOURCES,
            activities: createExportWorkbookActivities(deps),
            namespace: NAMESPACE,
            taskQueue: EXPORT_WORKBOOK_QUEUE_NAME,
            connection,
        });

        await worker.run();
    };

    const runImportWorkbookWorker = async () => {
        const worker = await Worker.create({
            ...WORKFLOWS_SOURCES,
            activities: createImportWorkbookActivities(deps),
            namespace: NAMESPACE,
            taskQueue: IMPORT_WORKBOOK_QUEUE_NAME,
            connection,
        });

        await worker.run();
    };

    const runClearExpiredWorker = async () => {
        const worker = await Worker.create({
            ...WORKFLOWS_SOURCES,
            activities: createClearExpiredActivities(deps),
            namespace: NAMESPACE,
            taskQueue: CLEAR_EXPIRED_QUEUE_NAME,
            connection,
        });

        await worker.run();
    };

    return Promise.all([
        runWorkerWithRestarts({
            ctx: deps.ctx,
            workerName: 'ExportWorkbook',
            runWorkerFn: runExportWorkbookWorker,
        }),
        runWorkerWithRestarts({
            ctx: deps.ctx,
            workerName: 'ImportWorkbook',
            runWorkerFn: runImportWorkbookWorker,
        }),
        runWorkerWithRestarts({
            ctx: deps.ctx,
            workerName: 'ClearExpired',
            runWorkerFn: runClearExpiredWorker,
        }),
    ]);
};
