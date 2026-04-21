const fichaService = require("../services/ficha.service");
const { ROLES } = require("../constants/dominio");
const { enviarCorreo } = require("../services/email.service");
const { fichaTemplate } = require("../services/templates/fichaTemplate");
const { crearNotificacion } = require("../services/notificacion.service");
const { createNotification, deleteNotificationsByTipoAndResourceIds } = require("../services/notificacion.service");

/**
 * Controlador de fichas.
 * Encapsula lógica de negocio y usa fichaService para la persistencia.
 */

async function obtenerFichas(req, res) {
  try {
    const { rol, id } = req.usuario;

    // Aprendiz: solo la ficha a la que pertenece
    if (rol === ROLES.APRENDIZ) {
      const pool = require("../db/database");
      const [rows] = await pool.query(
        `SELECT f.* FROM ficha f
         JOIN ficha_aprendiz fa ON fa.id_ficha = f.id
         WHERE fa.id_aprendiz = ?`,
        [id]
      );
      return res.status(200).json(rows);
    }

    // Instructor: solo las fichas que él creó (no eliminadas)
    if (rol === ROLES.INSTRUCTOR) {
      const pool = require("../db/database");
      const [rows] = await pool.query(
        "SELECT * FROM ficha WHERE id_instructor = ? AND (eliminada = 0 OR eliminada IS NULL)", [id]
      );
      return res.status(200).json(rows);
    }

    // Admin: todas
    const fichas = await fichaService.getAllFichas();
    res.status(200).json(fichas);
  } catch (error) {
    console.error("Error obtenerFichas:", error);
    res.status(500).json({ mensaje: "Error al obtener fichas" });
  }
}

async function obtenerFichaPorId(req, res) {
  try {
    const { id } = req.params;
    const ficha = await fichaService.getFichaById(id);

    if (!ficha) {
      return res.status(404).json({ mensaje: "Ficha no encontrada" });
    }

    res.status(200).json(ficha);
  } catch (error) {
    console.error("Error obtenerFichaPorId:", error);
    res.status(500).json({ mensaje: "Error al obtener ficha" });
  }
}

async function crearFicha(req, res) {
  try {
    // Instructor viene en el token
    const id_instructor = req.usuario.id;
    const { nombre, programa_formacion, jornada, cupo_maximo, ambiente_nombre, ambiente_nave, ambiente, nave } = req.body;
    const amb_nombre = ambiente_nombre || ambiente || null;
    const amb_nave = ambiente_nave || nave || null;

    const fichaExistente = await fichaService.getFichaByNombre(nombre);
    if (fichaExistente) {
      return res.status(409).json({ mensaje: "Esta ficha ya está registrada" });
    }

    await fichaService.createFicha({ nombre, programa_formacion, jornada, id_instructor, cupo_maximo, ambiente_nombre: amb_nombre, ambiente_nave: amb_nave });
    res.status(201).json({ mensaje: "Ficha creada correctamente" });
  } catch (error) {
    console.error("Error crearFicha:", error);
    res.status(500).json({ mensaje: "Error al crear ficha" });
  }
}

async function modificarFicha(req, res) {
  try {
    const { id } = req.params;
    const { nombre, programa_formacion, jornada, cupo_maximo, estado, ambiente_nombre, ambiente_nave, ambiente, nave } = req.body;
    const amb_nombre = ambiente_nombre || ambiente || null;
    const amb_nave = ambiente_nave || nave || null;

    if (req.usuario.rol !== ROLES.INSTRUCTOR) {
      return res.status(403).json({ mensaje: "Solo instructor puede modificar ficha" });
    }

    const ficha = await fichaService.getFichaById(id);
    if (!ficha) return res.status(404).json({ mensaje: "Ficha no encontrada" });

    if (Number(ficha.id_instructor) !== Number(req.usuario.id)) {
      return res.status(403).json({ mensaje: "No tienes permiso para modificar esta ficha" });
    }

    const otraFicha = await fichaService.getFichaByNombre(nombre);
    if (otraFicha && otraFicha.id !== Number(id)) {
      return res.status(409).json({ mensaje: "Ya existe otra ficha con el mismo nombre" });
    }

    const result = await fichaService.updateFicha(id, { nombre, programa_formacion, jornada, cupo_maximo, estado, ambiente_nombre: amb_nombre, ambiente_nave: amb_nave });
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "No se actualizó (ficha no encontrada)" });
    }

    res.status(200).json({ mensaje: "Ficha actualizada correctamente" });
  } catch (error) {
    console.error("Error modificarFicha:", error);
    res.status(500).json({ mensaje: "Error al modificar ficha" });
  }
}

async function eliminarFicha(req, res) {
  try {
    const { id } = req.params;
    const pool = require("../db/database");

    if (req.usuario.rol !== ROLES.INSTRUCTOR) {
      return res.status(403).json({ mensaje: "Solo instructor puede eliminar ficha" });
    }

    const ficha = await fichaService.getFichaById(id);
    if (!ficha) {
      return res.status(404).json({ mensaje: "Ficha no encontrada" });
    }

    if (Number(ficha.id_instructor) !== Number(req.usuario.id)) {
      return res.status(403).json({ mensaje: "No tienes permiso para eliminar esta ficha" });
    }

    const [aprendices] = await pool.query("SELECT id_aprendiz FROM ficha_aprendiz WHERE id_ficha = ?", [id]);
    const aprendizIds = aprendices.map((row) => row.id_aprendiz);

    let reportIds = [];
    if (aprendizIds.length > 0) {
      const [reportRows] = await pool.query("SELECT id_reporte FROM reportes WHERE id_aprendiz IN (?)", [aprendizIds]);
      reportIds = reportRows.map((row) => row.id_reporte);
      await pool.query("DELETE FROM reportes WHERE id_aprendiz IN (?)", [aprendizIds]);
      if (reportIds.length > 0) {
        await deleteNotificationsByTipoAndResourceIds('reporte', reportIds);
      }

      // Limpiar asignaciones de portátiles relacionadas con esos aprendices
      const [portatilRows] = await pool.query(
        `SELECT DISTINCT pa.id_portatil
         FROM portatil_aprendiz pa
         WHERE pa.id_aprendiz IN (?) AND pa.estado = 'activo'`,
        [aprendizIds]
      );
      const portatilIds = portatilRows.map((row) => row.id_portatil);
      if (portatilIds.length > 0) {
        await pool.query("UPDATE portatil SET estado = 'disponible', id_aprendiz = NULL WHERE id_portatil IN (?)", [portatilIds]);
        await pool.query("UPDATE portatil_aprendiz SET estado = 'inactivo' WHERE id_aprendiz IN (?) AND estado = 'activo'", [aprendizIds]);
      }
    }

    await pool.query("DELETE FROM ficha_aprendiz WHERE id_ficha = ?", [id]);

    // Marcar ficha como eliminada (papelera) en vez de borrarla
    await pool.query(
      "UPDATE ficha SET eliminada = 1, fecha_eliminacion = NOW(), estado = 'cerrada' WHERE id = ?",
      [id]
    );

    res.status(200).json({ mensaje: "Ficha eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminarFicha:", error);
    res.status(500).json({ mensaje: "Error al eliminar ficha" });
  }
}

async function unirseFicha(req, res) {
  try {
    const { id } = req.params; // id
    const id_aprendiz = req.usuario.id;

    if (req.usuario.rol !== ROLES.APRENDIZ) {
      return res.status(403).json({ mensaje: "Solo aprendiz puede unirse a ficha" });
    }

    const ficha = await fichaService.getFichaById(id);
    if (!ficha) {
      return res.status(404).json({ mensaje: "Ficha no encontrada" });
    }

    if (ficha.estado !== "activa") {
      return res.status(400).json({ mensaje: "Solo fichas activas permiten unirse" });
    }

    const repetido = await fichaService.hasAprendizJoined(id, id_aprendiz);
    if (repetido) {
      return res.status(409).json({ mensaje: "El aprendiz ya está inscrito en esta ficha" });
    }

    const yaEnOtraFicha = await fichaService.aprendizYaEnAlgunaFicha(id_aprendiz);
    if (yaEnOtraFicha) {
      return res.status(409).json({ mensaje: "El aprendiz ya pertenece a una ficha" });
    }

    const inscritos = await fichaService.countAprendices(id);
    if (inscritos >= ficha.cupo_maximo) {
      return res.status(400).json({ mensaje: "Capacidad máxima alcanzada" });
    }

    await fichaService.addAprendizToFicha(id, id_aprendiz);

    // 📧 Notificación al aprendiz
    const aprendizData = await fichaService.getAprendizById(id_aprendiz);
    if (aprendizData?.correo) {
      const html = fichaTemplate(aprendizData.nombre, ficha.nombre, ficha.programa_formacion, ficha.jornada, "unido");
      await enviarCorreo(aprendizData.correo, "✅ Te uniste a una ficha - Digital Hub", html);
    }

    res.status(201).json({ mensaje: "Aprendiz unido a ficha correctamente" });
  } catch (error) {
    console.error("Error unirseFicha:", error);
    res.status(500).json({ mensaje: "Error al unirse a ficha" });
  }
}

async function asignarAprendiz(req, res) {
  try {
    const { id } = req.params;
    const { correo_aprendiz } = req.body;

    if (req.usuario.rol !== ROLES.INSTRUCTOR) {
      return res.status(403).json({ mensaje: "Solo instructor puede asignar aprendices" });
    }

    if (!correo_aprendiz) {
      return res.status(400).json({ mensaje: "correo_aprendiz es obligatorio" });
    }

    const ficha = await fichaService.getFichaById(id);
    if (!ficha) {
      return res.status(404).json({ mensaje: "Ficha no encontrada" });
    }

    if (ficha.estado !== "activa") {
      return res.status(400).json({ mensaje: "No se puede asignar a ficha que no está activa" });
    }

    const aprendiz = await fichaService.getAprendizByCorreo(correo_aprendiz);
    if (!aprendiz || aprendiz.rol !== ROLES.APRENDIZ || aprendiz.estado !== "activo") {
      return res.status(400).json({ mensaje: "Aprendiz inválido o no activo" });
    }

    const repetido = await fichaService.hasAprendizJoined(id, aprendiz.id_usuario);
    if (repetido) {
      return res.status(409).json({ mensaje: "El aprendiz ya está inscrito" });
    }

    const yaEnOtraFicha = await fichaService.aprendizYaEnAlgunaFicha(aprendiz.id_usuario);
    if (yaEnOtraFicha) {
      return res.status(409).json({ mensaje: "El aprendiz ya pertenece a una ficha" });
    }

    const inscritos = await fichaService.countAprendices(id);
    if (inscritos >= ficha.cupo_maximo) {
      return res.status(400).json({ mensaje: "Cupo máximo alcanzado" });
    }

    await fichaService.addAprendizToFicha(id, aprendiz.id_usuario);

    // 📧 Notificación al aprendiz asignado
    const html = fichaTemplate(aprendiz.nombre, ficha.nombre, ficha.programa_formacion, ficha.jornada, "asignado");
    await enviarCorreo(aprendiz.correo, "✅ Fuiste asignado a una ficha - Digital Hub", html);
    await crearNotificacion(
      aprendiz.id_usuario,
      "Asignado a ficha",
      `Fuiste asignado a la ficha "${ficha.nombre}" (${ficha.programa_formacion} · ${ficha.jornada})`,
      "success"
    );
    await createNotification(
      aprendiz.id_usuario,
      'ficha',
      'Asignación a ficha',
      `Has sido asignado a la ficha ${ficha.nombre}.`,
      Number(id)
    );

    res.status(201).json({ mensaje: "Aprendiz asignado correctamente" });
  } catch (error) {
    console.error("Error asignarAprendiz:", error);
    res.status(500).json({ mensaje: "Error al asignar aprendiz" });
  }
}

module.exports = {
  obtenerFichas,
  obtenerFichaPorId,
  crearFicha,
  modificarFicha,
  eliminarFicha,
  unirseFicha,
  asignarAprendiz
};
