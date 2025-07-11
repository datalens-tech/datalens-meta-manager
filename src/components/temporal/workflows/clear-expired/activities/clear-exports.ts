import {raw} from 'objection';

import {ExportModel, ExportModelColumn} from '../../../../../db/models';
import {ActivitiesDeps} from '../../../types';

const LIMIT = 500;

export const clearExports = async (
    _: ActivitiesDeps,
): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const deletedTotal = await ExportModel.query(ExportModel.primary)
        .delete()
        .where(ExportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(LIMIT)
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
