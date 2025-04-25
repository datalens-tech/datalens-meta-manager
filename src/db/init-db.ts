import path from 'path';

import type {NodeKit} from '@gravity-ui/nodekit';
import {getModel, initDB as initPostgresDB} from '@gravity-ui/postgreskit';
import type {Knex} from 'knex';

import {isTruthyEnvVariable} from '../utils';

import {convertCamelCase} from './utils/camel-case';

const DEFAULT_QUERY_TIMEOUT = 40000;

export const getKnexOptions = (): Knex.Config => ({
    client: 'pg',
    pool: {
        min: 0,
        max: 15,
        acquireTimeoutMillis: 40000,
        createTimeoutMillis: 50000,
        idleTimeoutMillis: 45000,
        reapIntervalMillis: 1000,
    },
    acquireConnectionTimeout: 10000,
    migrations: {
        directory: path.resolve(__dirname, 'migrations'),
        tableName: 'migrations',
        extension: 'js',
        loadExtensions: ['.js'],
    },
    postProcessResponse: (result: unknown): unknown => {
        let dataFormed;

        if (Array.isArray(result)) {
            dataFormed = result.map((dataObj) => convertCamelCase(dataObj));
        } else if (result !== null && typeof result === 'object') {
            dataFormed = convertCamelCase(result);
        } else {
            dataFormed = result;
        }

        return dataFormed;
    },
    wrapIdentifier: (value, origImpl) => {
        const snakeCaseFormat = value.replace(/(?=[A-Z])/g, '_').toLowerCase();

        return origImpl(snakeCaseFormat);
    },
    debug: false,
});

export class Model extends getModel() {
    static DEFAULT_QUERY_TIMEOUT = DEFAULT_QUERY_TIMEOUT;
}

export const initDB = (nodekit: NodeKit) => {
    const dsnList = process.env.POSTGRES_DSN_LIST as string;

    const suppressStatusLogs = isTruthyEnvVariable('SUPPRESS_DB_STATUS_LOGS');

    const dispatcherOptions = {
        healthcheckInterval: 5000,
        healthcheckTimeout: 2000,
        suppressStatusLogs,
    };

    const {db, helpers} = initPostgresDB({
        connectionString: dsnList,
        dispatcherOptions,
        knexOptions: getKnexOptions(),
        logger: {
            info: (...args) => nodekit.ctx.log(...args),
            error: (...args) => nodekit.ctx.logError(...args),
        },
    });

    async function getId() {
        const queryResult = await db.primary.raw('select get_id() as id');
        return queryResult.rows[0].id;
    }

    return {db, Model, getId, helpers};
};
