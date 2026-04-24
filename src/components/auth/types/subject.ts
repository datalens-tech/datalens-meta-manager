import type {UserRole} from '../constants/role';
import {ACCESS_TOKEN_TYPE} from '../constants/token';

export type CtxSubjectSubject = {
    type: typeof ACCESS_TOKEN_TYPE.USER;
    userId: string;
    sessionId: string;
    accessToken: string;
    roles: `${UserRole}`[];
};

export type CtxServiceAccountSubject = {
    type: typeof ACCESS_TOKEN_TYPE.SERVICE_ACCOUNT;
    userId: string;
    accessToken: string;
    roles: `${UserRole}`[];
};

export type CtxSubject = CtxSubjectSubject | CtxServiceAccountSubject;
