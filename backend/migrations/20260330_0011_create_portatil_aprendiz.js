exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('portatil_aprendiz');
  if (exists) return;
  return knex.schema.createTable('portatil_aprendiz', function(table) {
    table.increments('id').primary();
    table.bigInteger('id_portatil').unsigned().notNullable();
    table.integer('id_aprendiz').unsigned().notNullable();
    table.timestamp('fecha_asignacion').defaultTo(knex.fn.now());
    table.string('estado', 30).notNullable().defaultTo('activo');
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('portatil_aprendiz');
};
