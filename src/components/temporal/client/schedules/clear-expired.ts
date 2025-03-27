import {clearExpired} from '../../workflows/clear-expired';
import {CLEAR_EXPIRED_QUEUE_NAME} from '../../workflows/clear-expired/constants';
import {getClient} from '../client';

const SCHEDULE_ID = 'clear-expired-v1';

export const createClearExpiredSchedule = async () => {
    const client = await getClient();

    const handle = client.schedule.getHandle(SCHEDULE_ID);
    let scheduleExists = false;

    try {
        await handle.describe();
        scheduleExists = true;
    } catch (error) {}

    if (!scheduleExists) {
        await client.schedule.create({
            action: {
                type: 'startWorkflow',
                workflowType: clearExpired,
                taskQueue: CLEAR_EXPIRED_QUEUE_NAME,
            },
            scheduleId: SCHEDULE_ID,
            spec: {
                intervals: [{every: '1h'}],
            },
        });
    }
};
