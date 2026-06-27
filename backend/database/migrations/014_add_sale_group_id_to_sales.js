exports.up = async function(knex) {
  const hasSaleGroupId = await knex.schema.hasColumn('sales', 'sale_group_id');

  if (!hasSaleGroupId) {
    await knex.schema.alterTable('sales', function(table) {
      table.string('sale_group_id', 64).nullable().after('id');
      table.index('sale_group_id');
    });

    const rows = await knex('sales').select('id');
    for (const row of rows) {
      await knex('sales')
        .where({ id: row.id })
        .update({ sale_group_id: `sale-${row.id}` });
    }
  }
};

exports.down = async function(knex) {
  const hasSaleGroupId = await knex.schema.hasColumn('sales', 'sale_group_id');

  if (hasSaleGroupId) {
    await knex.schema.alterTable('sales', function(table) {
      table.dropIndex(['sale_group_id']);
      table.dropColumn('sale_group_id');
    });
  }
};
