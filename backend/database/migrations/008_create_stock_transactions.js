exports.up = function(knex) {
  return knex.schema.createTable('stock_transactions', function(table) {
    table.increments('id').primary();
    table.integer('stock_id').unsigned().notNullable();
    table.integer('department_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.enum('action_type', ['ADD', 'REMOVE']).notNullable();
    table.decimal('quantity', 12, 2).notNullable();
    table.integer('receipt_id').unsigned().nullable();
    table.text('remarks').nullable();
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('stock_id').references('id').inTable('stocks');
    table.foreign('department_id').references('id').inTable('departments');
    table.foreign('user_id').references('id').inTable('users');
    table.foreign('receipt_id').references('id').inTable('receipts');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('stock_transactions');
};
