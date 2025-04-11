import {getRequiredEnvVariable} from '../../../../utils';

const endpoint = getRequiredEnvVariable('UI_API_ENDPOINT');

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
