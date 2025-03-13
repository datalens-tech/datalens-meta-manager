import {raw} from 'objection';

import {ImportModelColumn} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

const LIMIT = 1000;

export const clearImports = async ({
    models: {ImportModel},
}: ActivitiesDeps): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const deletedTotal = await ImportModel.query(ImportModel.primary)
        .delete()
        .where(ImportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(1000)
        .timeout(ImportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
