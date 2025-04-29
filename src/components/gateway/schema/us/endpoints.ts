import {getEnvVariable} from '../../../../utils';

const endpoint = getEnvVariable('US_ENDPOINT') ?? '';

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
