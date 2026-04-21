exports.up = async function(knex) {
  const tieneEliminada = await knex.schema.hasColumn('ficha', 'eliminada');
  if (tieneEliminada) return;
  await knex.schema.alterTable('ficha', function(table) {
    table.boolean('eliminada').defaultTo(false);
    table.timestamp('fecha_eliminacion').nullable();
  });
};
exports.down = async function(knex) {
  await knex.schema.alterTable('ficha', function(table) {
    table.dropColumn('eliminada');
    table.dropColumn('fecha_eliminacion');
  });
};
