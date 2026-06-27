exports.up = function(knex) {
  return knex.schema.createTable('stocks', function(table) {
    table.increments('id').primary();
    table.integer('department_id').unsigned().notNullable();
    table.integer('category_id').unsigned().notNullable();
    table.string('name').notNullable();
    table.decimal('current_quantity', 12, 2).defaultTo(0);
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('department_id').references('id').inTable('departments');
    table.foreign('category_id').references('id').inTable('categories');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('stocks');
};
