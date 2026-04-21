exports.up = async function(knex) {
  const tieneAmbiente = await knex.schema.hasColumn('ficha', 'ambiente_nombre');
  if (tieneAmbiente) return;
  await knex.schema.alterTable('ficha', function(table) {
    table.string('ambiente_nombre', 150).nullable();
    table.string('ambiente_nave', 100).nullable();
  });
};
exports.down = async function(knex) {
  await knex.schema.alterTable('ficha', function(table) {
    table.dropColumn('ambiente_nombre');
    table.dropColumn('ambiente_nave');
  });
};
