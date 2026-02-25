/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("tariffs", (table) => {
        table.increments("id").primary();
        table.date("date").notNullable();

        table.date("dt_next_box").nullable();
        table.date("dt_till_max").nullable();

        table.decimal("box_delivery_base", 14, 2).nullable();
        table.decimal("box_delivery_coef_expr", 10, 2).nullable();
        table.decimal("box_delivery_liter", 10, 2).nullable();

        table.decimal("box_delivery_marketplace_base", 14, 2).nullable();
        table.decimal("box_delivery_marketplace_coef_expr", 10, 2).nullable();
        table.decimal("box_delivery_marketplace_liter", 10, 2).nullable();

        table.decimal("box_storage_base", 14, 2).nullable();
        table.decimal("box_storage_coef_expr", 10, 2).nullable();
        table.decimal("box_storage_liter", 10, 2).nullable();

        table.string("warehouse_name").notNullable();
        table.string("geo_name").notNullable();

        table.decimal("coefficient", 10, 2).notNullable();
        table.decimal("delivery_price", 14, 2).nullable();
        table.decimal("storage_price", 14, 2).nullable();
        
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());

        table.unique(["date", "warehouse_name"]);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("tariffs");
}
