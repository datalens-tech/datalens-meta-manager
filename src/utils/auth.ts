import {DL_AUTH_HEADER_KEY} from '../constants';

export const createAuthHeader = (accessToken: string): string => {
    return `${DL_AUTH_HEADER_KEY} ${accessToken}`;
};
