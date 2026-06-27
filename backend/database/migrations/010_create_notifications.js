exports.up = function(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.increments('id').primary();
    table.enum('type', ['STOCK_ADD', 'STOCK_REMOVE', 'SALE_CREATED', 'REPORT_GENERATED']).notNullable();
    table.integer('reference_id').unsigned().notNullable();
    table.text('message').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notifications');
};
