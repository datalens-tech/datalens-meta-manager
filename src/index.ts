import {ExpressKit} from '@gravity-ui/expresskit';
import dotenv from 'dotenv';

dotenv.config();

import {finalRequestHandler} from './components/middlewares';
import {nodekit} from './nodekit';
import {getRoutes} from './routes';

nodekit.config.appFinalErrorHandler = finalRequestHandler;

const app = new ExpressKit(nodekit, getRoutes());

if (require.main === module) {
    app.run();
}

export default app;
