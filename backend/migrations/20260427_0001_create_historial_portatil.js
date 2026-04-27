exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('historial_portatil');
  if (exists) return;
  return knex.schema.createTable('historial_portatil', function(table) {
    table.increments('id').primary();
    table.integer('id_portatil').unsigned().notNullable();
    table.string('campo_modificado', 100).notNullable();
    table.string('valor_anterior', 255).nullable();
    table.string('valor_nuevo', 255).nullable();
    table.string('modificado_por', 150).nullable();
    table.timestamp('fecha').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('historial_portatil');
};
