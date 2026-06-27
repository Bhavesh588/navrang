exports.up = function(knex) {
  return knex.schema.createTable('device_tokens', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('platform').notNullable();
    table.string('push_token').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_seen_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users');
    table.unique(['user_id', 'push_token']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('device_tokens');
};
