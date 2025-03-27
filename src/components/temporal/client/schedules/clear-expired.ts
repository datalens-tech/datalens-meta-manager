import {ScheduleOverlapPolicy} from '@temporalio/client';

import {clearExpired} from '../../workflows/clear-expired';
import {CLEAR_EXPIRED_QUEUE_NAME} from '../../workflows/clear-expired/constants';
import {getClient} from '../client';

const SCHEDULE_ID = 'clear-expired';

export const createClearExpiredSchedule = async () => {
    const client = await getClient();

    const handle = client.schedule.getHandle(SCHEDULE_ID);
    let scheduleExists = false;

    await handle
        .describe()
        .then(() => {
            scheduleExists = true;
        })
        .catch();

    if (!scheduleExists) {
        await client.schedule.create({
            action: {
                type: 'startWorkflow',
                workflowType: clearExpired,
                args: [],
                taskQueue: CLEAR_EXPIRED_QUEUE_NAME,
            },
            scheduleId: SCHEDULE_ID,
            policies: {
                catchupWindow: '1 day',
                overlap: ScheduleOverlapPolicy.ALLOW_ALL,
            },
            spec: {
                intervals: [{every: '1h'}],
            },
        });
    }
};
