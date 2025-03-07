import {Worker} from '@temporalio/worker';

import {NAMESPACE} from './constants';
import {ActivitiesDeps} from './types';
import {createActivities as createExportWorkbookActivities} from './workflows/export-workbook/activities';
import {EXPORT_WORKBOOK_QUEUE_NAME} from './workflows/export-workbook/constants';

const WORKFLOW_SOURCES =
    process.env.APP_ENV === 'development'
        ? {workflowsPath: require.resolve('./workflows')}
        : {
              workflowBundle: {
                  codePath: require.resolve('../../../workflow-bundle.js'),
              },
          };

export const initWorkers = (deps: ActivitiesDeps) => {
    const runExportWorker = async () => {
        const exportWorkbookWorker = await Worker.create({
            ...WORKFLOW_SOURCES,
            activities: createExportWorkbookActivities(deps),
            namespace: NAMESPACE,
            taskQueue: EXPORT_WORKBOOK_QUEUE_NAME,
        });

        await exportWorkbookWorker.run();
    };

    return Promise.all([runExportWorker()]);
};
