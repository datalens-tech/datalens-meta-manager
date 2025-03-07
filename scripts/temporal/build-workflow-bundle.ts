import {writeFile} from 'fs/promises';
import path from 'path';

import {bundleWorkflowCode} from '@temporalio/worker';

const buildWorkflowBundle = async () => {
    const {code} = await bundleWorkflowCode({
        workflowsPath: require.resolve('../../src/components/temporal/workflows'),
    });
    const bundlePath = path.join(__dirname, '../../dist/workflow-bundle.js');

    await writeFile(bundlePath, code);
    console.log(`Bundle written to ${bundlePath}`);
};

buildWorkflowBundle().catch((err) => {
    console.error(err);
    process.exit(1);
});
