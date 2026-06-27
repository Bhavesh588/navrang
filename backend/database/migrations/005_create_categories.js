exports.up = function(knex) {
  return knex.schema.createTable('categories', function(table) {
    table.increments('id').primary();
    table.integer('department_id').unsigned().notNullable();
    table.integer('parent_id').unsigned().nullable();
    table.string('name').notNullable();
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('department_id').references('id').inTable('departments');
    table.foreign('parent_id').references('id').inTable('categories');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('categories');
};
