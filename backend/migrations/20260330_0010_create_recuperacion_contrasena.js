exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('recuperacion_contrasena');
  if (exists) return;
  return knex.schema.createTable('recuperacion_contrasena', function(table) {
    table.increments('id').primary();
    table.integer('id_usuario').unsigned().notNullable();
    table.string('codigo', 10).notNullable();
    table.timestamp('expira_en').notNullable();
    table.boolean('usado').defaultTo(false);
    table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('recuperacion_contrasena');
};
