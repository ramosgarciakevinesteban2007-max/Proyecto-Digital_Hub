const express = require("express");
const router = express.Router();
const pool = require("../db/database");

const verificarToken = require("../middlewares/verificarToken");
const verificarRol = require("../middlewares/verificarRol");
const validarCamposObligatorios = require("../middlewares/validarCamposObligatorios");
const validarSerialUnico = require("../middlewares/validarSerialUnico");
const { enviarCorreo } = require("../services/email.service");
const { asignacionEquipoTemplate } = require("../services/templates/asignacionEquipoTemplate");
const { crearNotificacion } = require("../services/notificacion.service");


/*
=========================================
1. CREAR PORTÁTIL
=========================================
Solo ADMIN o INSTRUCTOR
*/

router.post(
  "/",
  verificarToken,
  verificarRol(["administrador", "instructor"]),
  validarCamposObligatorios(["num_serie", "marca", "tipo", "modelo", "estado"]),
  validarSerialUnico,
  async (req, res) => {
    try {
      const { num_serie, marca, tipo, modelo, estado, ubicacion, descripcion } = req.body;
      const id_instructor = req.usuario.id;

      const [resultado] = await pool.query(
        `INSERT INTO portatil (num_serie, marca, tipo, modelo, estado, ubicacion, descripcion, id_instructor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [num_serie, marca, tipo, modelo, estado, ubicacion || '', descripcion || '', id_instructor]
      );

      res.status(201).json({
        mensaje: "Portátil registrado correctamente",
        id_portatil: resultado.insertId
      });

    } catch (error) {
      console.error("ERROR CREAR PORTATIL:", error.message);
      res.status(500).json({ mensaje: "Error al registrar el portátil", detalle: error.message });
    }
  }
);

/*
=========================================
2. LISTAR TODOS LOS PORTÁTILES HOLA
=========================================
*/

router.get(
  "/",
  verificarToken,
  async (req, res) => {
    try {
      const { rol, id } = req.usuario;
      let { page = 1, limit = 100 } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;

      // APRENDIZ: portátiles asignados via portatil_aprendiz
      if (rol === "aprendiz") {
        const [rows] = await pool.query(
          `SELECT p.*, pa.fecha_asignacion, pa.estado AS estado_asignacion
           FROM portatil_aprendiz pa
           JOIN portatil p ON pa.id_portatil = p.id_portatil
           WHERE pa.id_aprendiz = ? AND pa.estado = 'activo' AND p.estado = 'asignado'`,
          [id]
        );
        return res.json({ total: rows.length, pagina: 1, totalPaginas: 1, data: rows });
      }

      // INSTRUCTOR: solo los que él creó
      if (rol === "instructor") {
        const [rows] = await pool.query(
          "SELECT * FROM portatil WHERE id_instructor = ? LIMIT ? OFFSET ?",
          [id, limit, offset]
        );
        const [[{ total }]] = await pool.query(
          "SELECT COUNT(*) as total FROM portatil WHERE id_instructor = ?", [id]
        );
        return res.json({ total, pagina: page, totalPaginas: Math.ceil(total / limit), data: rows });
      }

      // ADMIN: todos
      const [rows] = await pool.query("SELECT * FROM portatil LIMIT ? OFFSET ?", [limit, offset]);
      const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM portatil");
      res.json({ total, pagina: page, totalPaginas: Math.ceil(total / limit), data: rows });

    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al obtener los portátiles" });
    }
  }
);


/*
=========================================
3. OBTENER PORTÁTIL POR ID
=========================================
*/

router.get(
  "/:id",
  verificarToken,
  async (req, res) => {

    try {

      const { id } = req.params;

      const [rows] = await pool.query(
        "SELECT * FROM portatil WHERE id_portatil = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          mensaje: "Portátil no encontrado"
        });
      }

      res.json(rows[0]);

    } catch (error) {

      res.status(500).json({
        mensaje: "Error al obtener el portátil"
      });

    }

  }
);


/*
=========================================
4. ACTUALIZAR PORTÁTIL
=========================================
Solo ADMIN o INSTRUCTOR
*/


router.put(
  "/:id",
  verificarToken,
  verificarRol(["administrador", "instructor"]),
  validarCamposObligatorios(["marca", "tipo", "modelo", "estado"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { marca, tipo, modelo, estado, ubicacion, descripcion } = req.body;

      // Obtener valores anteriores
      const [anterior] = await pool.query(
        "SELECT * FROM portatil WHERE id_portatil = ?", [id]
      );
      if (anterior.length === 0)
        return res.status(404).json({ mensaje: "Portátil no encontrado" });

      const viejo = anterior[0];

      // Instructor solo puede editar sus propios portátiles
      if (req.usuario.rol === "instructor" && viejo.id_instructor !== req.usuario.id) {
        return res.status(403).json({ mensaje: "No tienes permiso para editar este portátil" });
      }

      const modificadoPor = req.usuario?.correo || req.usuario?.nombre || `usuario #${req.usuario?.id}`;

      // Detectar cambios y registrarlos
      const campos = { marca, tipo, modelo, estado };
      for (const [campo, valorNuevo] of Object.entries(campos)) {
        const valorAnterior = viejo[campo];
        if (String(valorAnterior) !== String(valorNuevo)) {
          await pool.query(
            `INSERT INTO historial_portatil 
             (id_portatil, campo_modificado, valor_anterior, valor_nuevo, modificado_por)
             VALUES (?, ?, ?, ?, ?)`,
            [id, campo, valorAnterior, valorNuevo, modificadoPor]
          );
        }
      }

      // Actualizar portátil
      const [resultado] = await pool.query(
        `UPDATE portatil
         SET marca = ?, tipo = ?, modelo = ?, estado = ?, ubicacion = ?, descripcion = ?,
             id_aprendiz = CASE WHEN ? != 'asignado' THEN NULL ELSE id_aprendiz END
         WHERE id_portatil = ?`,
        [marca, tipo, modelo, estado, ubicacion || '', descripcion || '', estado, id]
      );

      if (resultado.affectedRows === 0)
        return res.status(404).json({ mensaje: "Portátil no encontrado" });

      if (estado !== 'asignado') {
        await pool.query(
          "UPDATE portatil_aprendiz SET estado = 'inactivo' WHERE id_portatil = ?", [id]
        );
      }

      res.json({ mensaje: "Portátil actualizado correctamente" });

    } catch (error) {
      console.error("ERROR EDITAR:", error.message);
      res.status(500).json({ mensaje: "Error al actualizar el portátil" });
    }
  }
);


/*
=========================================
4.1 HISTORIAL DE CAMBIOS DE UN PORTÁTIL
=========================================
*/
router.get(
  "/:id/historial",
  verificarToken,
  verificarRol(["administrador", "instructor"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query(
        `SELECT * FROM historial_portatil 
         WHERE id_portatil = ? 
         ORDER BY fecha DESC`,
        [id]
      );
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al obtener historial" });
    }
  }
);


/*
=========================================
4.5 CAMBIAR ESTADO (papelera / restaurar)
=========================================
*/
router.patch(
  "/:id/estado",
  verificarToken,
  verificarRol(["administrador", "instructor"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      if (!estado) return res.status(400).json({ mensaje: "estado es obligatorio" });

      const [rows] = await pool.query("SELECT * FROM portatil WHERE id_portatil = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ mensaje: "Portátil no encontrado" });

      if (req.usuario.rol === "instructor" && rows[0].id_instructor !== req.usuario.id) {
        return res.status(403).json({ mensaje: "No tienes permiso sobre este portátil" });
      }

      await pool.query("UPDATE portatil SET estado = ? WHERE id_portatil = ?", [estado, id]);

      // Si pasa a no-asignado, desactivar asignación
      if (estado !== "asignado") {
        await pool.query("UPDATE portatil_aprendiz SET estado = 'inactivo' WHERE id_portatil = ?", [id]);
      }

      res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al actualizar estado" });
    }
  }
);

/*
=========================================
5. ELIMINAR PORTÁTIL
=========================================
ADMIN o INSTRUCTOR (instructor solo los suyos)
*/

router.delete(
  "/:id",
  verificarToken,
  verificarRol(["administrador", "instructor"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await pool.query("SELECT * FROM portatil WHERE id_portatil = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ mensaje: "Portátil no encontrado" });

      if (req.usuario.rol === "instructor" && rows[0].id_instructor !== req.usuario.id) {
        return res.status(403).json({ mensaje: "No puedes eliminar un portátil que no registraste" });
      }

      await pool.query("DELETE FROM portatil WHERE id_portatil = ?", [id]);
      res.json({ mensaje: "Portátil eliminado correctamente" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al eliminar el portátil" });
    }
  }
);


/*
=========================================
6. ASIGNAR PORTÁTIL A APRENDIZ POR CORREO
=========================================
Solo INSTRUCTOR
*/
router.post(
  "/:id/asignar",
  verificarToken,
  verificarRol(["administrador", "instructor"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { correo_aprendiz } = req.body;

      if (!correo_aprendiz) {
        return res.status(400).json({ mensaje: "correo_aprendiz es obligatorio" });
      }

      // Verificar que el portátil existe
      const [portatilRows] = await pool.query(
        "SELECT * FROM portatil WHERE id_portatil = ?", [id]
      );
      if (portatilRows.length === 0) {
        return res.status(404).json({ mensaje: "Portátil no encontrado" });
      }
      const portatil = portatilRows[0];

      if (portatil.estado !== "disponible") {
        return res.status(400).json({ mensaje: "El portátil no está disponible para asignar" });
      }

      // Buscar aprendiz por correo
      const [aprendizRows] = await pool.query(
        "SELECT id_usuario, nombre, correo, rol, estado FROM usuario WHERE correo = ?",
        [correo_aprendiz.trim().toLowerCase()]
      );
      if (aprendizRows.length === 0) {
        return res.status(404).json({ mensaje: "No se encontró un usuario con ese correo" });
      }
      const aprendiz = aprendizRows[0];

      if (aprendiz.rol !== "aprendiz") {
        return res.status(400).json({ mensaje: "El usuario no tiene rol de aprendiz" });
      }
      if (aprendiz.estado !== "activo") {
        return res.status(400).json({ mensaje: "El aprendiz no está activo" });
      }

      // Validar que el aprendiz no tenga ya un equipo asignado activo
      const [equipoActual] = await pool.query(
        `SELECT pa.id, pa.id_portatil, p.estado AS estado_portatil
         FROM portatil_aprendiz pa
         JOIN portatil p ON pa.id_portatil = p.id_portatil
         WHERE pa.id_aprendiz = ? AND pa.estado = 'activo' LIMIT 1`,
        [aprendiz.id_usuario]
      );

      if (equipoActual.length > 0) {
        const eq = equipoActual[0];
        // Si el portátil ya no está en estado 'asignado', la asignación es huérfana — limpiarla
        if (eq.estado_portatil !== 'asignado') {
          await pool.query(
            "UPDATE portatil_aprendiz SET estado = 'inactivo' WHERE id_aprendiz = ? AND estado = 'activo'",
            [aprendiz.id_usuario]
          );
        } else {
          return res.status(400).json({ mensaje: "Este aprendiz ya tiene un equipo asignado activo" });
        }
      }

      // Validar que el aprendiz esté en una ficha
      const [fichaAprendiz] = await pool.query(
        "SELECT 1 FROM ficha_aprendiz WHERE id_aprendiz = ? LIMIT 1",
        [aprendiz.id_usuario]
      );
      if (fichaAprendiz.length === 0) {
        return res.status(400).json({ mensaje: "El aprendiz no está inscrito en ninguna ficha" });
      }

      // Insertar en portatil_aprendiz y actualizar portátil
      await pool.query(
        "INSERT INTO portatil_aprendiz (id_portatil, id_aprendiz, estado) VALUES (?, ?, 'activo')",
        [id, aprendiz.id_usuario]
      );
      await pool.query(
        "UPDATE portatil SET estado = 'asignado', id_aprendiz = ? WHERE id_portatil = ?",
        [aprendiz.id_usuario, id]
      );

      // 📧 Correo + 🔔 Notificación interna
      const html = asignacionEquipoTemplate(aprendiz.nombre, portatil.marca, portatil.modelo, portatil.num_serie, "asignado");
      await enviarCorreo(aprendiz.correo, "💻 Se te asignó un equipo - Digital Hub", html);
      await crearNotificacion(aprendiz.id_usuario, "Equipo asignado", `Se te asignó el portátil ${portatil.marca} ${portatil.modelo} (Serie: ${portatil.num_serie})`, "success");

      res.json({
        mensaje: `Portátil asignado correctamente a ${aprendiz.nombre}`,
        aprendiz: { nombre: aprendiz.nombre, correo: aprendiz.correo }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al asignar el portátil" });
    }
  }
);

/*
=========================================
7. VER APRENDICES DE UN PORTÁTIL
=========================================
*/
router.get("/:id/aprendices", verificarToken, verificarRol(["administrador", "instructor"]), async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.estado, pa.fecha_asignacion, pa.estado AS estado_asignacion
       FROM portatil_aprendiz pa
       JOIN usuario u ON pa.id_aprendiz = u.id_usuario
       WHERE pa.id_portatil = ?
       ORDER BY pa.fecha_asignacion DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener aprendices del portátil" });
  }
});

/*
=========================================
8. DESASIGNAR APRENDIZ DE UN PORTÁTIL
=========================================
*/
router.delete("/:id/aprendices/:idAprendiz", verificarToken, verificarRol(["administrador", "instructor"]), async (req, res) => {  try {
    const { id, idAprendiz } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM portatil_aprendiz WHERE id_portatil = ? AND id_aprendiz = ? AND estado = 'activo'",
      [id, idAprendiz]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Asignación activa no encontrada" });
    }

    await pool.query(
      "UPDATE portatil_aprendiz SET estado = 'inactivo' WHERE id_portatil = ? AND id_aprendiz = ?",
      [id, idAprendiz]
    );
    await pool.query(
      "UPDATE portatil SET estado = 'disponible', id_aprendiz = NULL WHERE id_portatil = ?",
      [id]
    );

    res.json({ mensaje: "Aprendiz desasignado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al desasignar el aprendiz" });
  }
});

/*
=========================================
9. LIMPIAR INCONSISTENCIAS DE ASIGNACIÓN
   Desactiva registros huérfanos en portatil_aprendiz
   (activos pero el portátil ya no está en estado 'asignado')
=========================================
*/
router.post("/limpiar-asignaciones", verificarToken, verificarRol(["administrador"]), async (req, res) => {
  try {
    // Desactivar registros activos cuyo portátil ya no está asignado
    const [r1] = await pool.query(
      `UPDATE portatil_aprendiz pa
       JOIN portatil p ON pa.id_portatil = p.id_portatil
       SET pa.estado = 'inactivo'
       WHERE pa.estado = 'activo' AND p.estado != 'asignado'`
    );
    // Poner NULL en id_aprendiz de portátiles que no tienen asignación activa
    const [r2] = await pool.query(
      `UPDATE portatil p
       SET p.id_aprendiz = NULL
       WHERE p.estado != 'asignado' AND p.id_aprendiz IS NOT NULL`
    );
    res.json({
      mensaje: "Limpieza completada",
      asignaciones_corregidas: r1.affectedRows,
      portatiles_corregidos: r2.affectedRows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al limpiar asignaciones" });
  }
});

module.exports = router;
