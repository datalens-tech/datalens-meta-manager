import {raw} from 'objection';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import {ActivitiesDeps} from '../../../types';

const LIMIT = 500;

export const clearImports = async (
    _: ActivitiesDeps,
): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const deletedTotal = await WorkbookImportModel.query(WorkbookImportModel.primary)
        .delete()
        .where(ImportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(LIMIT)
        .timeout(WorkbookImportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
