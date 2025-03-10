const endpoint = process.env.BI_API_ENDPOINT || 'http://localhost:8081';

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
