const pool = require("../db/database");

/**
 * Servicio de fichas - capa de acceso a datos de MySQL.
 */

async function getAllFichas() {
  const [rows] = await pool.query("SELECT * FROM ficha");
  return rows;
}

async function getFichaById(id) {
  const [rows] = await pool.query("SELECT * FROM ficha WHERE id = ?", [id]);
  return rows[0] || null;
}

async function createFicha({ nombre, programa_formacion, jornada, id_instructor, cupo_maximo, ambiente_nombre, ambiente_nave }) {
  const fecha_creacion = new Date();
  const estado = "activa";
  const [result] = await pool.query(
    `INSERT INTO ficha (nombre, programa_formacion, jornada, id_instructor, cupo_maximo, estado, fecha_creacion, ambiente_nombre, ambiente_nave)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, programa_formacion, jornada, id_instructor, cupo_maximo, estado, fecha_creacion, ambiente_nombre || null, ambiente_nave || null]
  );
  return result;
}

async function updateFicha(id, { nombre, programa_formacion, jornada, cupo_maximo, estado, ambiente_nombre, ambiente_nave }) {
  const query = `UPDATE ficha SET nombre = ?, programa_formacion = ?, jornada = ?, cupo_maximo = ?, estado = ?, ambiente_nombre = ?, ambiente_nave = ? WHERE id = ?`;
  const [result] = await pool.query(query, [nombre, programa_formacion, jornada, cupo_maximo, estado, ambiente_nombre || null, ambiente_nave || null, id]);
  return result;
}

async function deleteFicha(id) {
  const [result] = await pool.query("DELETE FROM ficha WHERE id = ?", [id]);
  return result;
}

async function countAprendices(id_ficha) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM ficha_aprendiz WHERE id_ficha = ?",
    [id_ficha]
  );
  return rows[0].total || 0;
}

async function hasAprendizJoined(id_ficha, id_aprendiz) {
  const [rows] = await pool.query(
    "SELECT 1 FROM ficha_aprendiz WHERE id_ficha = ? AND id_aprendiz = ?",
    [id_ficha, id_aprendiz]
  );
  return rows.length > 0;
}

async function aprendizYaEnAlgunaFicha(id_aprendiz) {
  const [rows] = await pool.query(
    "SELECT 1 FROM ficha_aprendiz WHERE id_aprendiz = ? LIMIT 1",
    [id_aprendiz]
  );
  return rows.length > 0;
}

async function addAprendizToFicha(id_ficha, id_aprendiz) {
  const fecha_union = new Date();
  const estado = "activo";
  const [result] = await pool.query(
    "INSERT INTO ficha_aprendiz (id_ficha, id_aprendiz, fecha_union, estado) VALUES (?, ?, ?, ?)",
    [id_ficha, id_aprendiz, fecha_union, estado]
  );
  return result;
}

async function getAprendizByCorreo(correo) {
  const [rows] = await pool.query("SELECT * FROM usuario WHERE correo = ?", [correo]);
  return rows[0] || null;
}

async function getAprendizById(id) {
  const [rows] = await pool.query("SELECT id_usuario, nombre, correo FROM usuario WHERE id_usuario = ?", [id]);
  return rows[0] || null;
}

async function getFichaByNombre(nombre) {
  const [rows] = await pool.query(
    "SELECT * FROM ficha WHERE nombre = ? AND (eliminada = 0 OR eliminada IS NULL)",
    [nombre]
  );
  return rows[0] || null;
}

module.exports = {
  getAllFichas,
  getFichaById,
  createFicha,
  updateFicha,
  deleteFicha,
  countAprendices,
  hasAprendizJoined,
  aprendizYaEnAlgunaFicha,
  addAprendizToFicha,
  getAprendizByCorreo,
  getAprendizById,
  getFichaByNombre
};
