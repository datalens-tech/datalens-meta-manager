import {ScheduleAlreadyRunning, ScheduleNotFoundError} from '@temporalio/client';

import {clearExpired} from '../../workflows/clear-expired';
import {CLEAR_EXPIRED_QUEUE_NAME} from '../../workflows/clear-expired/constants';
import {getClient} from '../client';

const SCHEDULE_ID = 'clear-expired';
const SCHEDULE_VERSION = '1';

export const createClearExpiredSchedule = async () => {
    const client = await getClient();

    const handle = client.schedule.getHandle(SCHEDULE_ID);

    try {
        await handle.describe();

        // If describe is successful, the schedule already exists.
        return;
    } catch (error) {
        if (!(error instanceof ScheduleNotFoundError)) {
            throw error;
        }
    }

    try {
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
            memo: {
                version: SCHEDULE_VERSION,
            },
        });
    } catch (error) {
        if (!(error instanceof ScheduleAlreadyRunning)) {
            throw error;
        }
    }
};
