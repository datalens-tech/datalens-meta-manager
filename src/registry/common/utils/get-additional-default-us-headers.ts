import {AppContext} from '@gravity-ui/nodekit';

export type GetAdditionalDefaultUsHeaders = (args: {
    ctx: AppContext;
}) => Record<string, string | undefined>;

export const getAdditionalDefaultUsHeaders: GetAdditionalDefaultUsHeaders = () => ({});
