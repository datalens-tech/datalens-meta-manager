import {raw} from 'objection';

import {ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import {registry} from '../../../../../registry';
import {ActivitiesDeps} from '../../../types';

const LIMIT = 500;

export const clearExports = async (
    _: ActivitiesDeps,
): Promise<{deletedTotal: number; limitReached: boolean}> => {
    const {db} = registry.getDbInstance();

    const deletedTotal = await WorkbookExportModel.query(db.primary)
        .delete()
        .where(ExportModelColumn.ExpiredAt, '<', raw('CURRENT_TIMESTAMP'))
        .limit(LIMIT)
        .timeout(WorkbookExportModel.DEFAULT_QUERY_TIMEOUT);

    return {deletedTotal, limitReached: deletedTotal === LIMIT};
};
