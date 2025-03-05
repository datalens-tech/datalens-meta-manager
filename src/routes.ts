import {AppRoutes} from '@gravity-ui/expresskit';

export const getRoutes = () => {
    const routes: AppRoutes = {
        'GET /ping': {
            handler: (req, res) => {
                res.status(200).send('pong');
            },
        },
    };

    return routes;
};
