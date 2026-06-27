exports.up = function(knex) {
  return knex.schema.createTable('user_departments', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('department_id').unsigned().notNullable();
    table.timestamps(true, true);
    
    // Foreign keys
    table.foreign('user_id').references('id').inTable('users');
    table.foreign('department_id').references('id').inTable('departments');
    
    // Composite unique constraint to prevent duplicate assignments
    table.unique(['user_id', 'department_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_departments');
};
