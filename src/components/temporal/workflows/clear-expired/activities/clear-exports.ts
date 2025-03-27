import {raw} from 'objection';

import {ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import {ActivitiesDeps} from '../../../types';

const LIMIT = 1000;

export const clearExports = async (
    _: ActivitiesDeps,
): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const deletedTotal = await WorkbookExportModel.query(WorkbookExportModel.primary)
        .delete()
        .where(ExportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(LIMIT)
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
