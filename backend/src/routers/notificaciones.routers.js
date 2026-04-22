const express = require("express");
const router = express.Router();
const pool = require("../db/database");
const verificarToken = require("../middlewares/verificarToken");

router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notificaciones WHERE id_usuario = ? ORDER BY fecha_creacion DESC LIMIT 20",
      [req.usuario.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ mensaje: "Error al obtener notificaciones" });
  }
});

router.get("/count", verificarToken, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM notificaciones WHERE id_usuario = ? AND leida = 0",
      [req.usuario.id]
    );
    res.json({ total, unread: total });
  } catch (e) {
    res.status(500).json({ mensaje: "Error" });
  }
});

router.get("/no-leidas", verificarToken, async (req, res) => {
  try {
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM notificaciones WHERE id_usuario = ? AND leida = 0",
      [req.usuario.id]
    );
    res.json({ total, unread: total });
  } catch (e) {
    res.status(500).json({ mensaje: "Error" });
  }
});

router.put("/leer", verificarToken, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notificaciones SET leida = 1 WHERE id_usuario = ?",
      [req.usuario.id]
    );
    res.json({ mensaje: "Notificaciones marcadas como leídas" });
  } catch (e) {
    res.status(500).json({ mensaje: "Error" });
  }
});

module.exports = router;
