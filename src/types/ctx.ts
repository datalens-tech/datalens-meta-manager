export interface UserCtxInfo {
    userId?: string;
    login?: string;
}

export type CtxInfo = {
    tenantId?: string;
    user: UserCtxInfo;
};
