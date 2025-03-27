import {raw} from 'objection';

import {ImportModelColumn, WorkbookImportModel} from '../../../../../db/models';
import {ActivitiesDeps} from '../../../types';

const LIMIT = 1000;

export const clearImports = async (
    _: ActivitiesDeps,
): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const deletedTotal = await WorkbookImportModel.query(WorkbookImportModel.primary)
        .delete()
        .where(ImportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(1000)
        .timeout(WorkbookImportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
