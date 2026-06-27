exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.integer('role_id').unsigned().notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Foreign key to roles
    table.foreign('role_id').references('id').inTable('roles');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
