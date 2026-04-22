exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('notificaciones');
  if (exists) return;
  return knex.schema.createTable('notificaciones', function(table) {
    table.increments('id').primary();
    table.integer('id_usuario').unsigned().notNullable();
    table.string('titulo', 150).notNullable();
    table.text('mensaje').notNullable();
    table.string('tipo', 30).defaultTo('info');
    table.boolean('leida').defaultTo(false);
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notificaciones');
};
