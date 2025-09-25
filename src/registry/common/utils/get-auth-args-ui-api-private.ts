import {AppContext} from '@gravity-ui/nodekit';

export type AuthArgsData = {
    usMasterToken?: string;
};

export type GetAuthArgsUiApiPrivate = (args: {ctx: AppContext}) => Promise<AuthArgsData>;

export const getAuthArgsUiApiPrivate: GetAuthArgsUiApiPrivate = async ({ctx}) => ({
    usMasterToken: ctx.config.usMasterToken as string,
});
