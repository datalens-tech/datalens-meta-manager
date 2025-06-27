import type {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.raw(`
        CREATE TABLE export_entries (
            export_id BIGINT NOT NULL REFERENCES exports(export_id) ON DELETE CASCADE,
            mock_entry_id TEXT NOT NULL,
            scope TEXT NOT NULL,
            data jsonb DEFAULT NULL,
            PRIMARY KEY (export_id, mock_entry_id)
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    return knex.raw(`
        DROP TABLE export_entries;
    `);
}
