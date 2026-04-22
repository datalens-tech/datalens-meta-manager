import type {UserRole} from '../constants/role';

export interface CtxSubjectSubject {
    userId: string;
    sessionId: string;
    accessToken: string;
    roles: `${UserRole}`[];
    type?: undefined;
}

export interface CtxServiceAccountSubject {
    serviceAccountId: string;
    accessToken: string;
    roles: `${UserRole}`[];
    type: 'service_account';
}

export type CtxSubject = CtxSubjectSubject | CtxServiceAccountSubject;
