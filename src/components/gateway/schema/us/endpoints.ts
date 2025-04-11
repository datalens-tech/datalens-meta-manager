import {getRequiredEnvVariable} from '../../../../utils';

const endpoint = getRequiredEnvVariable('US_ENDPOINT');

export const endpoints = {
    opensource: {
        development: {
            endpoint,
        },
        preprod: {
            endpoint,
        },
        prod: {
            endpoint,
        },
    },
};
