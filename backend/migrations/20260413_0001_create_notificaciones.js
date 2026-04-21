exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('notificaciones');
  if (exists) return;
  return knex.schema.createTable('notificaciones', function(table) {
    table.increments('id_notificacion').primary();
    table.integer('id_usuario').unsigned().notNullable();
    table.string('tipo', 50).notNullable();
    table.string('titulo', 150).notNullable();
    table.text('mensaje').notNullable();
    table.integer('recurso_id').unsigned().nullable();
    table.boolean('leida').notNullable().defaultTo(false);
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
    table.foreign('id_usuario').references('usuario.id_usuario').onDelete('CASCADE').onUpdate('CASCADE');
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('notificaciones');
};
