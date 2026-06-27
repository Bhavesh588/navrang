exports.up = function(knex) {
  return knex.schema.createTable('notification_queue', function(table) {
    table.increments('id').primary();
    table.integer('notification_id').unsigned().notNullable().references('id').inTable('notifications').onDelete('CASCADE');
    table.string('push_token', 255).notNullable();
    table.json('payload').notNullable();
    table.enu('status', ['pending', 'sent', 'failed']).defaultTo('pending');
    table.integer('attempts').defaultTo(0);
    table.integer('max_attempts').defaultTo(3);
    table.timestamp('next_retry_at').nullable();
    table.text('error_message').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notification_queue');
};