import {AppContext} from '@gravity-ui/nodekit';
import {TransactionOrKnex} from 'objection';

export type ServiceArgs = {
    ctx: AppContext;
    trx?: TransactionOrKnex;
};
