exports.up = function(knex) {
  return knex.schema.createTable('receipts', function(table) {
    table.increments('id').primary();
    table.string('file_url').notNullable();
    table.integer('uploaded_by').unsigned().notNullable();
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    // Foreign key
    table.foreign('uploaded_by').references('id').inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('receipts');
};
