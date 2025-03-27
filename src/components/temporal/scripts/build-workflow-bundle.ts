import {writeFile} from 'fs/promises';
import path from 'path';

import {bundleWorkflowCode} from '@temporalio/worker';

const buildWorkflowBundle = async () => {
    const {code} = await bundleWorkflowCode({
        workflowsPath: require.resolve('../workflows'),
    });
    const bundlePath = path.join(__dirname, '../../../../dist/workflow-bundle.js');

    await writeFile(bundlePath, code);
    console.log(`Bundle written to ${bundlePath}`);
};

buildWorkflowBundle().catch((error) => {
    console.error(error);
    process.exit(1);
});
