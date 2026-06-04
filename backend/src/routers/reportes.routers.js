const express = require("express");
const router = express.Router();
const pool = require("../db/database");

const { exportarReportesExcel, exportarReportesCSV } = require("../controllers/reportes.controller");
const verificarToken = require("../middlewares/verificarToken");
const verificarRol = require("../middlewares/verificarRol");
const uploadImagen = require("../middlewares/uploadImagen");
const { ROLES } = require("../constants/dominio");
const { enviarCorreo } = require("../services/email.service");
const { reporteTemplate } = require("../services/templates/reporteTemplate");
const { createNotification, deleteNotificationsByTipoAndResourceIds } = require("../services/notificacion.service");

// =============================
// 📥 EXPORTAR EXCEL
// =============================
router.get(
  "/excel",
  verificarToken,
  verificarRol([ROLES.ADMIN]),
  exportarReportesExcel
);
router.get(
  "/csv",
  verificarToken,
  verificarRol([ROLES.ADMIN]),
  exportarReportesCSV
);

// =============================
// 📄 GET - Todos
// - APRENDIZ: solo sus propios reportes
// - INSTRUCTOR: solo los reportes dirigidos a él
// - ADMIN: todos
// =============================
router.get("/", verificarToken, async (req, res) => {
  try {
    const { rol, id } = req.usuario;

    if (rol === ROLES.APRENDIZ) {
      const [rows] = await pool.query(
        `SELECT r.*, u.nombre AS nombre_aprendiz
         FROM reportes r
         LEFT JOIN usuario u ON r.id_aprendiz = u.id_usuario
         WHERE r.id_aprendiz = ?`,
        [id]
      );
      return res.json(rows);
    }

    if (rol === ROLES.INSTRUCTOR) {
      const [rows] = await pool.query(
        `SELECT r.*, u.nombre AS nombre_aprendiz, u.correo AS correo_aprendiz
         FROM reportes r
         LEFT JOIN usuario u ON r.id_aprendiz = u.id_usuario
         WHERE r.id_instructor = ?
         ORDER BY r.fecha_reporte DESC`,
        [id]
      );
      return res.json(rows);
    }

    // ADMIN ve todos
    const [rows] = await pool.query(
      `SELECT r.*, u.nombre AS nombre_aprendiz, u.correo AS correo_aprendiz
       FROM reportes r
       LEFT JOIN usuario u ON r.id_aprendiz = u.id_usuario
       ORDER BY r.fecha_reporte DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener reportes" });
  }
});

// =============================
// 🔍 GET - Por ID
// =============================
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "El ID debe ser numérico" });

    const [rows] = await pool.query(
      `SELECT r.*, u.nombre AS nombre_aprendiz
       FROM reportes r
       LEFT JOIN usuario u ON r.id_aprendiz = u.id_usuario
       WHERE r.id_reporte = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Reporte no encontrado" });

    // Aprendiz solo puede ver el suyo
    if (req.usuario.rol === ROLES.APRENDIZ && rows[0].id_aprendiz !== req.usuario.id) {
      return res.status(403).json({ message: "No tienes permiso para ver este reporte" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el reporte" });
  }
});

// =============================
// ➕ POST - SOLO APRENDIZ
// Body: { descripcion, fecha_reporte }
// El instructor se asigna automáticamente según el equipo del aprendiz
// =============================
router.post(
  "/",
  verificarToken,
  verificarRol([ROLES.APRENDIZ]),
  uploadImagen.single("archivo"),
  async (req, res) => {
    try {
      const { ESTADOS_REPORTE } = require("../constants/dominio");
      let { fecha_reporte, descripcion } = req.body;
      const estado_reporte = "pendiente";

      descripcion = descripcion?.trim();

      if (!fecha_reporte || !descripcion) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      const fecha = new Date(fecha_reporte);
      if (isNaN(fecha.getTime()) || fecha.getFullYear() < 2000) {
        return res.status(400).json({ message: "Fecha no válida" });
      }

      if (descripcion.length > 255) {
        return res.status(400).json({ message: "La descripción es demasiado larga (máx 255 caracteres)" });
      }

      if (req.file) {
        const tiposPermitidos = ["image/jpeg", "image/png", "application/pdf"];
        if (!tiposPermitidos.includes(req.file.mimetype)) {
          return res.status(400).json({ message: "Tipo de archivo no permitido (JPG, PNG o PDF)" });
        }
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({ message: "El archivo supera el tamaño permitido (5MB)" });
        }
      }

      // Verificar que el aprendiz tiene un equipo asignado activo y obtener el instructor asociado
      const id_aprendiz = req.usuario.id;
      const [equipoAsignado] = await pool.query(
        `SELECT pa.id_portatil, p.id_instructor
         FROM portatil_aprendiz pa
         JOIN portatil p ON pa.id_portatil = p.id_portatil
         WHERE pa.id_aprendiz = ? AND pa.estado = 'activo'
         LIMIT 1`,
        [id_aprendiz]
      );
      if (equipoAsignado.length === 0) {
        return res.status(400).json({ message: "No puedes crear un reporte sin tener un equipo asignado" });
      }

      // Buscar instructor asociado al equipo del aprendiz
      const id_instructor = equipoAsignado[0].id_instructor;
      let instructor = null;
      if (id_instructor) {
        const [instructorRows] = await pool.query(
          "SELECT id_usuario, nombre, correo FROM usuario WHERE id_usuario = ? AND rol = ?",
          [id_instructor, ROLES.INSTRUCTOR]
        );
        if (instructorRows.length > 0) instructor = instructorRows[0];
      }

      const archivo = req.file ? req.file.originalname : null;

      const [insertResult] = await pool.query(
        `INSERT INTO reportes (estado_reporte, fecha_reporte, archivo, descripcion, id_aprendiz, id_instructor)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [estado_reporte, fecha_reporte, archivo, descripcion, id_aprendiz, instructor ? instructor.id_usuario : null]
      );

      // Datos del aprendiz para los correos y notificaciones
      const [aprendizRows] = await pool.query(
        "SELECT nombre, correo FROM usuario WHERE id_usuario = ?",
        [id_aprendiz]
      );
      const aprendiz = aprendizRows[0];

      if (instructor) {
        await createNotification(
          instructor.id_usuario,
          'reporte',
          'Nuevo reporte pendiente',
          `El aprendiz ${aprendiz ? aprendiz.nombre : 'un aprendiz'} creó un nuevo reporte.`,
          insertResult.insertId
        );

        // 📧 Correo al instructor (notificación de nuevo reporte)
        const htmlInstructor = `
          <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
          <style>
            body{font-family:'Segoe UI',Arial,sans-serif;background:#0a0a0f;margin:0;padding:20px}
            .container{max-width:600px;margin:0 auto;background:#160b2e;border-radius:16px;overflow:hidden;border:1px solid rgba(127,90,240,0.4)}
            .header{background:linear-gradient(135deg,#1a0d3d 0%,#2d1a55 100%);padding:32px 24px;text-align:center;border-bottom:1px solid rgba(127,90,240,0.4)}
            .header h1{color:#f0eaff;margin:0 0 6px;font-size:26px;font-weight:800;letter-spacing:1px}
            .header p{color:#c9a8ff;margin:0;font-size:13px;opacity:0.8}
            .body{padding:32px}
            .body h2{color:#f0eaff;font-size:18px;margin:0 0 8px}
            .body p{color:#b8a8d8;line-height:1.6;font-size:14px;margin:0 0 20px}
            .info-box{background:#0f0820;border:1px solid rgba(127,90,240,0.35);border-left:4px solid #7f5af0;padding:18px 20px;border-radius:12px;margin:20px 0}
            .info-box p{margin:8px 0;color:#b8a8d8;font-size:14px}
            .info-box span{font-weight:700;color:#c9a8ff}
            .footer{background:#0f0820;padding:18px 32px;text-align:center;font-size:12px;color:#6a5a8a;border-top:1px solid rgba(127,90,240,0.2)}
          </style></head><body>
          <div class="container">
            <div class="header"><h1>Digital Hub</h1><p>Sistema de Gestión de Equipos</p></div>
            <div class="body">
              <h2>Hola, ${instructor.nombre} 👋</h2>
              <p>El aprendiz <strong style="color:#c9a8ff">${aprendiz ? aprendiz.nombre : 'un aprendiz'}</strong> ha enviado un nuevo reporte.</p>
              <div class="info-box">
                <p>👤 Aprendiz: <span>${aprendiz ? aprendiz.nombre : '-'}</span></p>
                <p>📅 Fecha: <span>${new Date(fecha_reporte).toLocaleDateString('es-CO', {year:'numeric',month:'long',day:'numeric'})}</span></p>
                <p>📝 Descripción: <span>${descripcion}</span></p>
                <p>📌 Estado: <span>pendiente</span></p>
              </div>
              <p>Ingresa a Digital Hub para revisar y gestionar este reporte.</p>
            </div>
            <div class="footer">© ${new Date().getFullYear()} Digital Hub · Correo automático, no responder.</div>
          </div></body></html>
        `;
        await enviarCorreo(instructor.correo, `📋 Nuevo reporte de ${aprendiz ? aprendiz.nombre : 'aprendiz'} - Digital Hub`, htmlInstructor);
        console.log(`📧 Correo instructor enviado a: ${instructor.correo}`);
      }

      // 📧 Correo al aprendiz (confirmación)
      if (aprendiz) {
        const htmlAprendiz = reporteTemplate(aprendiz.nombre, estado_reporte, fecha_reporte, descripcion);
        await enviarCorreo(aprendiz.correo, "📋 Reporte registrado - Digital Hub", htmlAprendiz);
      }

      res.status(201).json({ message: "Reporte creado correctamente" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear reporte" });
    }
  }
);

// =============================
// ✏️ PUT - Actualizar estado (ADMIN + INSTRUCTOR)
// =============================
router.put("/:id", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "El ID debe ser numérico" });

    const [existing] = await pool.query(
      `SELECT r.*, u.nombre AS nombre_aprendiz, u.correo AS correo_aprendiz
       FROM reportes r
       LEFT JOIN usuario u ON r.id_aprendiz = u.id_usuario
       WHERE r.id_reporte = ?`,
      [id]
    );
    if (existing.length === 0) return res.status(404).json({ message: "Reporte no encontrado" });

    const current = existing[0];
    const { ESTADOS_REPORTE } = require("../constants/dominio");

    let { estado_reporte, fecha_reporte, descripcion } = req.body;
    estado_reporte = estado_reporte?.trim() || current.estado_reporte;
    descripcion    = descripcion?.trim()    || current.descripcion;
    fecha_reporte  = fecha_reporte          || current.fecha_reporte;

    if (!ESTADOS_REPORTE.includes(estado_reporte)) {
      return res.status(400).json({ message: "Estado de reporte inválido", estados_validos: ESTADOS_REPORTE });
    }

    await pool.query(
      "UPDATE reportes SET estado_reporte = ?, fecha_reporte = ?, descripcion = ? WHERE id_reporte = ?",
      [estado_reporte, fecha_reporte, descripcion, id]
    );

    // 📧 Notificar al aprendiz que su reporte fue actualizado
    if (current.correo_aprendiz) {
      const htmlActualizacion = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
        <style>body{font-family:'Segoe UI',Arial,sans-serif;background:#0a0a0f;margin:0;padding:20px}.container{max-width:600px;margin:0 auto;background:#160b2e;border-radius:16px;overflow:hidden;border:1px solid rgba(127,90,240,0.4)}.header{background:linear-gradient(135deg,#1a0d3d 0%,#2d1a55 100%);padding:32px 24px;text-align:center;border-bottom:1px solid rgba(127,90,240,0.4)}.header h1{color:#f0eaff;margin:0 0 6px;font-size:26px;font-weight:800;letter-spacing:1px}.header p{color:#c9a8ff;margin:0;font-size:13px;opacity:0.8}.body{padding:32px}.body h2{color:#f0eaff;font-size:18px;margin:0 0 8px}.body p{color:#b8a8d8;line-height:1.6;font-size:14px;margin:0 0 20px}.info-box{background:#0f0820;border:1px solid rgba(127,90,240,0.35);border-left:4px solid #7f5af0;padding:18px 20px;border-radius:12px;margin:20px 0}.info-box p{margin:8px 0;color:#b8a8d8;font-size:14px}.info-box span{font-weight:700;color:#c9a8ff}.footer{background:#0f0820;padding:18px 32px;text-align:center;font-size:12px;color:#6a5a8a;border-top:1px solid rgba(127,90,240,0.2)}</style>
        </head><body><div class="container">
          <div class="header"><h1>Digital Hub</h1><p>Sistema de Gestión de Equipos</p></div>
          <div class="body">
            <h2>Hola, ${current.nombre_aprendiz || 'Aprendiz'} 👋</h2>
            <p>El estado de tu reporte ha sido <strong style="color:#c9a8ff">actualizado</strong> por tu instructor.</p>
            <div class="info-box">
              <p>📋 Reporte ID: <span>#${current.id_reporte}</span></p>
              <p>📝 Descripción: <span>${current.descripcion}</span></p>
              <p>📌 Nuevo estado: <span>${estado_reporte}</span></p>
            </div>
            <p>Ingresa a Digital Hub para ver el detalle de tu reporte.</p>
          </div>
          <div class="footer">© ${new Date().getFullYear()} Digital Hub · Correo automático, no responder.</div>
        </div></body></html>`;
      await enviarCorreo(current.correo_aprendiz, `📋 Tu reporte fue actualizado - Digital Hub`, htmlActualizacion);
    }

    await createNotification(
      current.id_aprendiz,
      'reporte',
      'Reporte actualizado',
      `Tu reporte #${current.id_reporte} se actualizó a "${estado_reporte}".`,
      current.id_reporte
    );

    res.json({ message: "Reporte actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el reporte" });
  }
});

// =============================
// 🗑️ DELETE (ADMIN + INSTRUCTOR)
// =============================
router.delete("/:id", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "El ID debe ser numérico" });

    const [resultado] = await pool.query("DELETE FROM reportes WHERE id_reporte = ?", [id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ message: "Reporte no encontrado" });

    await deleteNotificationsByTipoAndResourceIds('reporte', [id]);

    res.json({ message: "Reporte eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el reporte" });
  }
});

module.exports = router;
