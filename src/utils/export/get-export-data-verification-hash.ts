import crypto from 'crypto';

export const getExportDataVerificationHash = ({
    data,
    secret,
}: {
    data: object;
    secret: string;
}): string => {
    const hmac = crypto.createHmac('sha256', secret);

    hmac.update(JSON.stringify(data));

    return hmac.digest('hex');
};
