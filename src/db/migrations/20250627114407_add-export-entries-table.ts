import type {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.raw(`
        CREATE TABLE export_entries (
            export_id BIGINT NOT NULL,
            entry_id TEXT NOT NULL,
            mock_entry_id TEXT NOT NULL,
            scope TEXT NOT NULL,
            data jsonb DEFAULT NULL,
            notifications jsonb DEFAULT NULL,
            PRIMARY KEY (export_id, entry_id),
            FOREIGN KEY (export_id) REFERENCES exports(export_id) ON DELETE CASCADE
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    return knex.raw(`
        DROP TABLE export_entries;
    `);
}
