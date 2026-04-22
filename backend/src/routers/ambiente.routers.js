const express = require("express");
const router = express.Router();
const pool = require("../db/database");
const validarCamposObligatorios = require("../middlewares/validarCamposObligatorios");
const verificarToken = require("../middlewares/verificarToken");
const verificarRol = require("../middlewares/verificarRol");
const { ROLES } = require("../constants/dominio");

// GET - Todos los ambientes (cualquier usuario autenticado)
router.get("/", verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ambiente");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ambientes" });
  }
});

// GET - Ambiente por ID
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM ambiente WHERE id_ambiente = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Ambiente no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ambiente" });
  }
});

// POST - Crear ambiente (solo admin e instructor)
router.post(
  "/",
  verificarToken,
  verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]),
  validarCamposObligatorios(["nombre", "direccion"]),
  async (req, res) => {
    try {
      const { nombre, direccion } = req.body;
      await pool.query("INSERT INTO ambiente (nombre, direccion) VALUES (?, ?)", [nombre, direccion]);
      res.status(201).json({ message: "Ambiente creado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al crear ambiente" });
    }
  }
);

// PUT - Actualizar ambiente (solo admin e instructor)
router.put(
  "/:id",
  verificarToken,
  verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]),
  validarCamposObligatorios(["nombre", "direccion"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, direccion } = req.body;
      const [result] = await pool.query(
        "UPDATE ambiente SET nombre = ?, direccion = ? WHERE id_ambiente = ?",
        [nombre, direccion, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ message: "Ambiente no encontrado" });
      res.json({ message: "Ambiente actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar ambiente" });
    }
  }
);

// DELETE - Eliminar ambiente (solo admin)
router.delete("/:id", verificarToken, verificarRol([ROLES.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM ambiente WHERE id_ambiente = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Ambiente no encontrado" });
    res.json({ message: "Ambiente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar ambiente" });
  }
});

module.exports = router;
