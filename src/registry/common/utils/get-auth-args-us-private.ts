import {AppContext} from '@gravity-ui/nodekit';

export type AuthArgsData = {
    usMasterToken?: string;
};

export type GetAuthArgsUsPrivate = (args: {ctx: AppContext}) => Promise<AuthArgsData>;

export const getAuthArgsUsPrivate: GetAuthArgsUsPrivate = async ({ctx}) => ({
    usMasterToken: ctx.config.usMasterToken as string,
});
