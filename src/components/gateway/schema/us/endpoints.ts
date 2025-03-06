const endpoint = process.env.US_ENDPOINT || 'http://localhost:8083';

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
