import {Worker} from '@temporalio/worker';

import {isTruthyString} from '../../utils';

import {NAMESPACE} from './constants';
import {ActivitiesDeps} from './types';
import {createActivities as createClearExpiredActivities} from './workflows/clear-expired/activities';
import {CLEAR_EXPIRED_QUEUE_NAME} from './workflows/clear-expired/constants';
import {createActivities as createExportWorkbookActivities} from './workflows/export-workbook/activities';
import {EXPORT_WORKBOOK_QUEUE_NAME} from './workflows/export-workbook/constants';
import {createActivities as createImportWorkbookActivities} from './workflows/import-workbook/activities';
import {IMPORT_WORKBOOK_QUEUE_NAME} from './workflows/import-workbook/constants';

const WORKFLOWS_SOURCES =
    process.env.APP_DEV_MODE && isTruthyString(process.env.APP_DEV_MODE)
        ? {workflowsPath: require.resolve('./workflows')}
        : {
              workflowBundle: {
                  codePath: require.resolve('../../../workflow-bundle.js'),
              },
          };

export const initWorkers = (deps: ActivitiesDeps) => {
    const runExportWorkbookWorker = async () => {
        const worker = await Worker.create({
            ...WORKFLOWS_SOURCES,
            activities: createExportWorkbookActivities(deps),
            namespace: NAMESPACE,
            taskQueue: EXPORT_WORKBOOK_QUEUE_NAME,
        });

        await worker.run();
    };

    const runImportWorkbookWorker = async () => {
        const worker = await Worker.create({
            ...WORKFLOWS_SOURCES,
            activities: createImportWorkbookActivities(deps),
            namespace: NAMESPACE,
            taskQueue: IMPORT_WORKBOOK_QUEUE_NAME,
        });

        await worker.run();
    };

    const runClearExpiredWorker = async () => {
        const worker = await Worker.create({
            ...WORKFLOWS_SOURCES,
            activities: createClearExpiredActivities(deps),
            namespace: NAMESPACE,
            taskQueue: CLEAR_EXPIRED_QUEUE_NAME,
        });

        await worker.run();
    };

    return Promise.all([
        runExportWorkbookWorker(),
        runImportWorkbookWorker(),
        runClearExpiredWorker(),
    ]);
};
