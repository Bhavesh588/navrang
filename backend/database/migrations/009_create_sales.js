exports.up = function(knex) {
  return knex.schema.createTable('sales', function(table) {
    table.increments('id').primary();
    table.integer('department_id').unsigned().notNullable();
    table.integer('category_id').unsigned().notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.text('description').nullable();
    table.integer('created_by').unsigned().notNullable();
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('department_id').references('id').inTable('departments');
    table.foreign('category_id').references('id').inTable('categories');
    table.foreign('created_by').references('id').inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('sales');
};
