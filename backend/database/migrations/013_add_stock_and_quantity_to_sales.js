exports.up = async function(knex) {
  const hasStockId = await knex.schema.hasColumn('sales', 'stock_id');
  const hasQuantity = await knex.schema.hasColumn('sales', 'quantity');

  await knex.schema.alterTable('sales', function(table) {
    if (!hasStockId) {
      table.integer('stock_id').unsigned().nullable().after('id');
    }

    if (!hasQuantity) {
      table.decimal('quantity', 12, 2).notNullable().defaultTo(0).after('category_id');
    }
  });

  if (!hasStockId) {
    await knex.schema.alterTable('sales', function(table) {
      table.foreign('stock_id').references('id').inTable('stocks');
    });
  }
};

exports.down = async function(knex) {
  const hasStockId = await knex.schema.hasColumn('sales', 'stock_id');
  const hasQuantity = await knex.schema.hasColumn('sales', 'quantity');

  await knex.schema.alterTable('sales', function(table) {
    if (hasStockId) {
      table.dropForeign(['stock_id']);
      table.dropColumn('stock_id');
    }

    if (hasQuantity) {
      table.dropColumn('quantity');
    }
  });
};
