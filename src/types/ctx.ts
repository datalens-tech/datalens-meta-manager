export interface SubjectCtxInfo {
    subjectId?: string;
    login?: string;
}

export type CtxInfo = {
    tenantId?: string;
    subject: SubjectCtxInfo;
};
