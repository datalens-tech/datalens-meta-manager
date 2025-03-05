import type {ExpressKit} from '@gravity-ui/expresskit';

import type {initDB} from '../db/init-db';

type DbInstance = ReturnType<typeof initDB>;

let app: ExpressKit;
let dbInstance: DbInstance;

export const registry = {
    setupApp(appInstance: ExpressKit) {
        if (app) {
            throw new Error('The method must not be called more than once');
        }
        app = appInstance;
    },
    getApp() {
        if (!app) {
            throw new Error('First of all setup the app');
        }
        return app;
    },
    setupDbInstance(instance: DbInstance) {
        if (dbInstance) {
            throw new Error('The method must not be called more than once');
        }
        dbInstance = instance;
    },
    getDbInstance() {
        if (!dbInstance) {
            throw new Error('First of all setup the db');
        }
        return dbInstance;
    },
};

export type Registry = typeof registry;
