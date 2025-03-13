import {raw} from 'objection';

import {ExportModelColumn} from '../../../../../db/models';
import type {ActivitiesDeps} from '../../../types';

const LIMIT = 1000;

export const clearExports = async ({
    models: {ExportModel},
}: ActivitiesDeps): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const deletedTotal = await ExportModel.query(ExportModel.primary)
        .delete()
        .where(ExportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(LIMIT)
        .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
