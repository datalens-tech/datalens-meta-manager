import type {NodeKit} from '@gravity-ui/nodekit';

import type {Registry} from '../../registry';

export const setRegistryToContext = <R extends Registry>(nodekit: NodeKit, registry: R) => {
    nodekit.ctx.set('registry', registry as any);
};
