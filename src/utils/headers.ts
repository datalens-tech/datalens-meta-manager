import {TENANT_ID_HEADER} from '../constants';

export const makeTenantIdHeader = (tenantId: string | undefined): {[TENANT_ID_HEADER]?: string} => {
    return tenantId ? {[TENANT_ID_HEADER]: tenantId} : {};
};
