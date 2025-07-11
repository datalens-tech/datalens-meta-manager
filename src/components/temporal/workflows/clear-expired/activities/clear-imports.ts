import {raw} from 'objection';

import {ImportModel, ImportModelColumn} from '../../../../../db/models';
import {ActivitiesDeps} from '../../../types';

const LIMIT = 500;

export const clearImports = async (
    _: ActivitiesDeps,
): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const deletedTotal = await ImportModel.query(ImportModel.primary)
        .delete()
        .where(ImportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(LIMIT)
        .timeout(ImportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
