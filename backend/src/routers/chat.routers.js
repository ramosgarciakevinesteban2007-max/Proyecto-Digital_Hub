const express = require("express");
const router = express.Router();
const pool = require("../db/database");
const verificarToken = require("../middlewares/verificarToken");

async function verificarAccesoFicha(id_ficha, id_usuario, rol) {
  if (rol === "administrador") return true;
  if (rol === "instructor") {
    const [[ficha]] = await pool.query("SELECT id_instructor FROM ficha WHERE id = ?", [id_ficha]);
    return ficha && Number(ficha.id_instructor) === Number(id_usuario);
  }
  if (rol === "aprendiz") {
    const [rows] = await pool.query(
      "SELECT 1 FROM ficha_aprendiz WHERE id_ficha = ? AND id_aprendiz = ? LIMIT 1",
      [id_ficha, id_usuario]
    );
    return rows.length > 0;
  }
  return false;
}

router.get("/:id_ficha", verificarToken, async (req, res) => {
  try {
    const { id_ficha } = req.params;
    const { id, rol } = req.usuario;
    if (!(await verificarAccesoFicha(id_ficha, id, rol))) {
      return res.status(403).json({ mensaje: "No tienes acceso a este chat" });
    }
    const [rows] = await pool.query(
      `SELECT c.id, c.mensaje, c.fecha_envio, u.nombre, u.rol
       FROM chat_ficha c JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_ficha = ? ORDER BY c.fecha_envio ASC`,
      [id_ficha]
    );
    res.json(rows);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ mensaje: "Error al obtener mensajes" });
  }
});

router.post("/:id_ficha", verificarToken, async (req, res) => {
  try {
    const { id_ficha } = req.params;
    const { id, rol } = req.usuario;
    const { mensaje } = req.body;
    if (!mensaje?.trim()) return res.status(400).json({ mensaje: "Mensaje vacío" });
    if (!(await verificarAccesoFicha(id_ficha, id, rol))) {
      return res.status(403).json({ mensaje: "No tienes acceso a este chat" });
    }
    await pool.query(
      "INSERT INTO chat_ficha (id_ficha, id_usuario, mensaje) VALUES (?, ?, ?)",
      [id_ficha, id, mensaje.trim()]
    );
    const [[usuario]] = await pool.query("SELECT nombre, rol FROM usuario WHERE id_usuario = ?", [id]);
    res.status(201).json({
      mensaje: "Mensaje enviado",
      data: { id_ficha, id_usuario: id, mensaje: mensaje.trim(), nombre: usuario.nombre, rol: usuario.rol, fecha_envio: new Date() }
    });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ mensaje: "Error al enviar mensaje" });
  }
});

module.exports = router;
