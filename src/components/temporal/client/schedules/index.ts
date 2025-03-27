import {createClearExpiredSchedule} from './clear-expired';

export const initSchedules = async () => {
    await createClearExpiredSchedule();
};
