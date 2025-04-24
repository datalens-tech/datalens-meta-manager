import {writeFile} from 'fs/promises';
import path from 'path';

import {bundleWorkflowCode} from '@temporalio/worker';

const buildWorkflowBundle = async () => {
    const {code} = await bundleWorkflowCode({
        workflowsPath: require.resolve('../workflows'),
    });

    const pathParam =
        process.argv[2] ?? '../../../../dist/server/components/temporal/workflow-bundle.js';

    const bundlePath = path.join(__dirname, pathParam);

    await writeFile(bundlePath, code);
    console.log(`Bundle written to ${bundlePath}`);
};

buildWorkflowBundle().catch((error) => {
    console.error(error);
    process.exit(1);
});
