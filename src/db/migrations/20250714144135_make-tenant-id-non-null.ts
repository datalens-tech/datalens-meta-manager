import type {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.raw(`
        UPDATE imports SET tenant_id = '' WHERE tenant_id IS NULL;
        UPDATE exports SET tenant_id = '' WHERE tenant_id IS NULL;
        
        ALTER TABLE imports ALTER COLUMN tenant_id SET NOT NULL;
        ALTER TABLE exports ALTER COLUMN tenant_id SET NOT NULL;
    `);
}

export async function down(knex: Knex): Promise<void> {
    return knex.raw(`
        ALTER TABLE imports ALTER COLUMN tenant_id DROP NOT NULL;
        ALTER TABLE exports ALTER COLUMN tenant_id DROP NOT NULL;
    `);
}
