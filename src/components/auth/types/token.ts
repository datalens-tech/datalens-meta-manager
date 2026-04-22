import type {UserRole} from '../constants/role';

export interface ExpirableTokenPayload {
    iat: number;
    exp: number;
}

export interface UserAccessTokenPayload extends ExpirableTokenPayload {
    userId: string;
    sessionId: string;
    roles: `${UserRole}`[];
    type?: undefined;
}

export interface ServiceAccountAccessTokenPayload extends ExpirableTokenPayload {
    serviceAccountId: string;
    roles: `${UserRole}`[];
    type: 'service_account';
}

export type SubjectAccessTokenPayload = UserAccessTokenPayload | ServiceAccountAccessTokenPayload;
