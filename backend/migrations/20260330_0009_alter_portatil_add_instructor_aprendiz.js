exports.up = async function(knex) {
  const tieneInstructor = await knex.schema.hasColumn('portatil', 'id_instructor');
  const tieneAprendiz   = await knex.schema.hasColumn('portatil', 'id_aprendiz');
  await knex.schema.alterTable('portatil', function(table) {
    if (!tieneInstructor) table.integer('id_instructor').unsigned().nullable();
    if (!tieneAprendiz)   table.integer('id_aprendiz').unsigned().nullable();
  });
};
exports.down = async function(knex) {
  await knex.schema.alterTable('portatil', function(table) {
    table.dropColumn('id_instructor');
    table.dropColumn('id_aprendiz');
  });
};
