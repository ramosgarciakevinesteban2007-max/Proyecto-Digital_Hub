const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/verificarToken");
const verificarRol = require("../middlewares/verificarRol");
const { ROLES } = require("../constants/dominio");
const {
  exportarPortatilesExcel, exportarPortatilesCSV,
  exportarUsuariosExcel,   exportarUsuariosCSV,
  exportarAmbientesExcel,  exportarAmbientesCSV,
  exportarFichasExcel,     exportarFichasCSV,
  exportarReportesExcel,   exportarReportesCSV,
  generarExcelDiseño,
} = require("../services/exportacion.service");

// PORTÁTILES — instructor solo ve los suyos (filtrado en el service)
router.get("/portatiles/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarPortatilesExcel);
router.get("/portatiles/csv",   verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarPortatilesCSV);

// USUARIOS
router.get("/usuarios/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarUsuariosExcel);
router.get("/usuarios/csv",   verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarUsuariosCSV);

// AMBIENTES
router.get("/ambientes/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarAmbientesExcel);
router.get("/ambientes/csv",   verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarAmbientesCSV);

// FICHAS — instructor solo ve las suyas (filtrado en el service)
router.get("/fichas/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarFichasExcel);
router.get("/fichas/csv",   verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarFichasCSV);

// REPORTES — admin ve todos, instructor solo los suyos
router.get("/reportes/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarReportesExcel);
router.get("/reportes/csv",   verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarReportesCSV);

// REPORTES POR FICHA
router.get("/reportes/ficha/:id", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), async (req, res) => {
  const db = require("../db/database");
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const [rows] = await db.query(
      `SELECT
         r.id_reporte,
         u.nombre        AS aprendiz,
         r.descripcion,
         r.estado_reporte,
         r.fecha_reporte,
         r.archivo
       FROM reportes r
       JOIN usuario u ON r.id_aprendiz = u.id_usuario
       JOIN ficha_aprendiz fa ON fa.id_aprendiz = u.id_usuario
       WHERE fa.id_ficha = ?
       ORDER BY r.fecha_reporte DESC`,
      [id]
    );

    const [fichaRows] = await db.query("SELECT nombre FROM ficha WHERE id_ficha = ?", [id]);
    const nombreFicha = fichaRows[0]?.nombre || `Ficha ${id}`;

    const columnas = [
      { header:"ID",          key:"id_reporte",     width:8  },
      { header:"Aprendiz",    key:"aprendiz",       width:24 },
      { header:"Descripción", key:"descripcion",    width:40 },
      { header:"Estado",      key:"estado_reporte", width:16 },
      { header:"Fecha",       key:"fecha_reporte",  width:20 },
      { header:"Evidencia",   key:"archivo",        width:24 },
    ];

    generarExcelDiseño(res, rows, `Reportes — ${nombreFicha}`, `reportes_ficha_${id}`, columnas);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al exportar" });
  }
});

module.exports = router;
