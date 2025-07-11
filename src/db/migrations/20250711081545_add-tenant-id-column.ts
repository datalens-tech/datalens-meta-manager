import type {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.raw(`
        ALTER TABLE imports ADD COLUMN tenant_id TEXT DEFAULT NULL;
        CREATE INDEX imports_import_id_tenant_id_idx ON imports (import_id, tenant_id);
        
        ALTER TABLE exports ADD COLUMN tenant_id TEXT DEFAULT NULL;
        CREATE INDEX exports_export_id_tenant_id_idx ON exports (export_id, tenant_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
    return knex.raw(`
        DROP INDEX imports_import_id_tenant_id_idx;
        ALTER TABLE imports DROP COLUMN tenant_id;
        
        DROP INDEX exports_export_id_tenant_id_idx;
        ALTER TABLE exports DROP COLUMN tenant_id;
    `);
}
