import type {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.raw(`
        CREATE SEQUENCE counter_seq;

        CREATE OR REPLACE FUNCTION get_id(OUT result bigint) AS $$
        DECLARE
            our_epoch bigint := 1514754000000;
            seq_id bigint;
            now_millis bigint;
            shard_id int := 11;
        BEGIN
            SELECT nextval('counter_seq') % 4096 INTO seq_id;

            SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
            result := (now_millis - our_epoch) << 23;
            result := result | (shard_id << 10);
            result := result | (seq_id);
        END;
        $$ LANGUAGE PLPGSQL;


        CREATE TYPE EXPORT_STATUS AS ENUM ('pending', 'success', 'error');

        CREATE TABLE exports (
            export_id BIGINT NOT NULL PRIMARY KEY DEFAULT get_id(),
            status EXPORT_STATUS NOT NULL DEFAULT('pending'),
            data jsonb DEFAULT '{}',
            notifications jsonb,
            error jsonb,
            created_by TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            expired_at TIMESTAMPTZ NOT NULL
        );



        CREATE TYPE IMPORT_STATUS AS ENUM ('pending', 'success', 'error');

        CREATE TABLE imports (
            import_id BIGINT NOT NULL PRIMARY KEY DEFAULT get_id(),
            status IMPORT_STATUS NOT NULL DEFAULT('pending'),
            data jsonb DEFAULT '{}',
            ids_map jsonb DEFAULT '{}',
            error jsonb,
            created_by TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            expired_at TIMESTAMPTZ NOT NULL
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    return knex.raw(`
        DROP TABLE exports;
        DROP TYPE EXPORT_STATUS;

        DROP TABLE imports;
        DROP TYPE IMPORT_STATUS;

        DROP SEQUENCE counter_seq;
    `);
}
