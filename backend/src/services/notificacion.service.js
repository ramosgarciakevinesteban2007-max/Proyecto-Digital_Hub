const pool = require("../db/database");

const crearNotificacion = async (id_usuario, titulo, mensaje, tipo = "info") => {
  try {
    await pool.query(
      "INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)",
      [id_usuario, titulo, mensaje, tipo]
    );
  } catch (e) {
    console.error("Error crearNotificacion:", e.message);
  }
};

const createNotification = async (id_usuario, tipo, titulo, mensaje, id_recurso) => {
  try {
    await pool.query(
      "INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)",
      [id_usuario, titulo, mensaje, tipo || "info"]
    );
  } catch (e) {
    console.error("Error createNotification:", e.message);
  }
};

const deleteNotificationsByTipoAndResourceIds = async (tipo, ids) => {};

module.exports = { crearNotificacion, createNotification, deleteNotificationsByTipoAndResourceIds };
