import {getEnvVariable} from '../../../../utils';

const endpoint = getEnvVariable('UI_API_ENDPOINT') ?? '';

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
