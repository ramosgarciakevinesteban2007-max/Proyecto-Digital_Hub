exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('chat_ficha');
  if (exists) return;
  return knex.schema.createTable('chat_ficha', function(table) {
    table.increments('id').primary();
    table.integer('id_ficha').unsigned().notNullable();
    table.integer('id_usuario').unsigned().notNullable();
    table.text('mensaje').notNullable();
    table.timestamp('fecha_envio').defaultTo(knex.fn.now());
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('chat_ficha');
};
