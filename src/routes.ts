import {AppRoutes} from '@gravity-ui/expresskit';

import {ExportModel, ExportModelColumn} from './db/models';

export const getRoutes = () => {
    const routes: AppRoutes = {
        'GET /ping': {
            handler: async (req, res) => {
                const result = await ExportModel.query(ExportModel.replica)
                    .select([ExportModelColumn.ExportId])
                    .first()
                    .timeout(ExportModel.DEFAULT_QUERY_TIMEOUT);

                res.status(200).send(result?.exportId);
            },
        },
    };

    return routes;
};
