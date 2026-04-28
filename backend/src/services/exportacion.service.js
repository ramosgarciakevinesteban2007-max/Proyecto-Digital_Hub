const ExcelJS = require("exceljs");
const db = require("../db/database");

// ── Paleta ──────────────────────────────────────────────
const C = {
  bg1:"FF0A0A0F", bg2:"FF160B2E", bg3:"FF1A0F35", card:"FF241545",
  purple:"FF7F5AF0", purpleL:"FFC9A8FF", text:"FFF0EAFF", muted:"FFB8A8D8",
  green:"FF4ADE80", yellow:"FFFACC15", orange:"FFFB923C", red:"FFF87171",
};
const fill  = a => ({ type:"pattern", pattern:"solid", fgColor:{ argb:a } });
const aln   = (h, v="middle") => ({ horizontal:h, vertical:v });
const hline = (ws, row, cols, color) => {
  ws.getRow(row).height = 4;
  for (let c = 1; c <= cols; c++) ws.getCell(row, c).fill = fill(color);
};
const fechaHoy = () => new Date().toLocaleDateString("es-CO", { year:"numeric", month:"long", day:"numeric" });
const limpiar  = v => {
  if (v instanceof Date) return v.toISOString().split("T")[0];
  if (v === null || v === undefined) return "";
  return String(v);
};

// ── Generador genérico con diseño oscuro ────────────────
const generarExcelDiseño = async (res, rows, titulo, nombreArchivo, columnas) => {
  try {
    const COLS = columnas.length;
    const lastCol = String.fromCharCode(64 + COLS);
    const fecha = fechaHoy();

    const wb = new ExcelJS.Workbook();
    wb.creator = "DigitalHub"; wb.created = new Date();

    const ws = wb.addWorksheet(titulo, {
      pageSetup: { paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1 },
      properties: { tabColor:{ argb:C.purple } },
      views: [{ showGridLines:false }],
    });

    ws.columns = columnas.map(c => ({ width: c.width || 22 }));

    // Fila 1 — espacio superior
    ws.getRow(1).height = 48;
    ws.mergeCells(`A1:${lastCol}1`);
    ws.getCell("A1").fill = fill(C.bg1);

    // Fila 2 — Título
    ws.getRow(2).height = 38;
    ws.mergeCells(`A2:${lastCol}2`);
    const t = ws.getCell("A2");
    t.value     = `DIGITAL HUB — ${titulo}`;
    t.font      = { size:18, bold:true, color:{ argb:C.purpleL } };
    t.fill      = fill(C.bg1);
    t.alignment = aln("center");

    // Fila 3 — Subtítulo con fecha
    ws.getRow(3).height = 22;
    ws.mergeCells(`A3:${lastCol}3`);
    const s = ws.getCell("A3");
    s.value     = `Generado el ${fecha}   ·   Total: ${rows.length} registros`;
    s.font      = { italic:true, size:10, color:{ argb:C.muted } };
    s.fill      = fill(C.bg2);
    s.alignment = aln("center");

    // Fila 4 — línea púrpura
    hline(ws, 4, COLS, C.purple);

    // Fila 5 — Encabezados
    ws.getRow(5).height = 28;
    columnas.forEach((col, i) => {
      const c = ws.getCell(5, i + 1);
      c.value     = col.header;
      c.font      = { bold:true, size:11, color:{ argb:C.text } };
      c.fill      = fill(C.card);
      c.alignment = aln("center");
      c.border    = { bottom:{ style:"medium", color:{ argb:C.purple } } };
    });

    // Filas de datos
    rows.forEach((item, idx) => {
      const valores = columnas.map(col => limpiar(item[col.key]));
      const row = ws.addRow(valores);
      row.height = 22;
      const rowBg = idx % 2 === 0 ? C.bg3 : C.bg2;
      row.eachCell((cell) => {
        cell.fill      = fill(rowBg);
        cell.font      = { size:10, color:{ argb:C.text } };
        cell.alignment = aln("center");
        cell.border    = { bottom:{ style:"thin", color:{ argb:C.card } } };
      });
    });

    ws.views = [{ state:"frozen", ySplit:5, showGridLines:false }];

    const buffer = await wb.xlsx.writeBuffer();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}.xlsx"`);
    res.setHeader("Content-Length", buffer.byteLength);
    res.end(buffer);
  } catch (error) {
    console.error("Error exportar excel:", error);
    res.status(500).json({ error:"Error al exportar Excel", detalle:error.message });
  }
};

// ── CSV genérico ────────────────────────────────────────
const exportarCSVGenerico = async (res, rows, nombreArchivo, columnas) => {
  try {
    const header = columnas.map(c => c.header).join(",");
    const csv = [header, ...rows.map(row =>
      columnas.map(col => {
        let v = row[col.key] != null ? String(row[col.key]) : "";
        v = v.replace(/"/g, '""');
        return (v.includes(",") || v.includes("\n")) ? `"${v}"` : v;
      }).join(",")
    )].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}.csv"`);
    res.send("\uFEFF" + csv);
  } catch (error) {
    res.status(500).json({ error:"Error al exportar CSV" });
  }
};

// ── Portátiles ──────────────────────────────────────────
const COLS_PORTATILES = [
  { header:"ID",            key:"id_portatil",      width:8  },
  { header:"Serial",        key:"num_serie",         width:22 },
  { header:"Marca",         key:"marca",             width:18 },
  { header:"Tipo",          key:"tipo",              width:16 },
  { header:"Modelo",        key:"modelo",            width:20 },
  { header:"Estado",        key:"estado",            width:16 },
  { header:"Ubicación",     key:"ubicacion",         width:20 },
  { header:"Descripción",   key:"descripcion",       width:30 },
  { header:"Instructor",    key:"instructor_nombre", width:24 },
  { header:"Aprendiz",      key:"aprendiz_nombre",   width:24 },
];

const queryPortatiles = (idInstructor = null, estado = null) => {
  const conditions = [];
  if (idInstructor) conditions.push(`p.id_instructor = ${idInstructor}`);
  if (estado) conditions.push(`p.estado = '${estado}'`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return `
    SELECT
      p.id_portatil, p.num_serie, p.marca, p.tipo, p.modelo,
      p.estado, p.ubicacion, p.descripcion,
      ui.nombre AS instructor_nombre,
      ua.nombre AS aprendiz_nombre
    FROM portatil p
    LEFT JOIN usuario ui ON p.id_instructor = ui.id_usuario
    LEFT JOIN usuario ua ON p.id_aprendiz   = ua.id_usuario
    ${where}
    ORDER BY p.id_portatil DESC
  `;
};

const exportarPortatilesExcel = async (req, res) => {
  try {
    const idInstructor = req.usuario.rol === "instructor" ? req.usuario.id : null;
    const { estado } = req.query;
    const [rows] = await db.query(queryPortatiles(idInstructor, estado || null));
    generarExcelDiseño(res, rows, "Portátiles", "portatiles", COLS_PORTATILES);
  } catch (error) {
    console.error("Error exportar portatiles excel:", error);
    res.status(500).json({ mensaje: "Error al exportar portátiles", detalle: error.message });
  }
};

const exportarPortatilesCSV = async (req, res) => {
  try {
    const idInstructor = req.usuario.rol === "instructor" ? req.usuario.id : null;
    const { estado } = req.query;
    const [rows] = await db.query(queryPortatiles(idInstructor, estado || null));
    exportarCSVGenerico(res, rows, "portatiles", COLS_PORTATILES);
  } catch (error) {
    console.error("Error exportar portatiles csv:", error);
    res.status(500).json({ mensaje: "Error al exportar portátiles", detalle: error.message });
  }
};

// ── Usuarios ────────────────────────────────────────────
const COLS_USUARIOS = [
  { header:"ID",      key:"id_usuario", width:8  },
  { header:"Nombre",  key:"nombre",     width:24 },
  { header:"Correo",  key:"correo",     width:30 },
  { header:"Rol",     key:"rol",        width:16 },
  { header:"Estado",  key:"estado",     width:16 },
];

const exportarUsuariosExcel = async (req, res) => {
  const { rol, estado } = req.query;
  const conditions = [];
  if (rol) conditions.push(`rol = '${rol}'`);
  if (estado) conditions.push(`estado = '${estado}'`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.query(
    `SELECT id_usuario, nombre, correo, rol, estado FROM usuario ${where} ORDER BY id_usuario DESC`
  );
  generarExcelDiseño(res, rows, "Usuarios", "usuarios", COLS_USUARIOS);
};

const exportarUsuariosCSV = async (req, res) => {
  const { rol, estado } = req.query;
  const conditions = [];
  if (rol) conditions.push(`rol = '${rol}'`);
  if (estado) conditions.push(`estado = '${estado}'`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.query(
    `SELECT id_usuario, nombre, correo, rol, estado FROM usuario ${where} ORDER BY id_usuario DESC`
  );
  exportarCSVGenerico(res, rows, "usuarios", COLS_USUARIOS);
};

// ── Ambientes ───────────────────────────────────────────
const COLS_AMBIENTES = [
  { header:"ID",        key:"id_ambiente", width:8  },
  { header:"Nombre",    key:"nombre",      width:24 },
  { header:"Nave",      key:"nave",        width:16 },
  { header:"Dirección", key:"direccion",   width:30 },
];

const exportarAmbientesExcel = async (req, res) => {
  const [rows] = await db.query("SELECT id_ambiente, nombre, nave, direccion FROM ambiente ORDER BY id_ambiente DESC");
  generarExcelDiseño(res, rows, "Ambientes", "ambientes", COLS_AMBIENTES);
};

const exportarAmbientesCSV = async (req, res) => {
  const [rows] = await db.query("SELECT id_ambiente, nombre, nave, direccion FROM ambiente ORDER BY id_ambiente DESC");
  exportarCSVGenerico(res, rows, "ambientes", COLS_AMBIENTES);
};

// ── Fichas ──────────────────────────────────────────────
const COLS_FICHAS = [
  { header:"ID",                 key:"id",                 width:8  },
  { header:"Nombre/Número",      key:"nombre",             width:20 },
  { header:"Programa Formación", key:"programa_formacion", width:30 },
  { header:"Jornada",            key:"jornada",            width:14 },
  { header:"Estado",             key:"estado",             width:14 },
  { header:"Cupo Máximo",        key:"cupo_maximo",        width:14 },
  { header:"Instructor",         key:"instructor_nombre",  width:24 },
  { header:"Ambiente",           key:"ambiente_nombre",    width:20 },
  { header:"Nave",               key:"ambiente_nave",      width:14 },
  { header:"Aprendices",         key:"total_aprendices",   width:14 },
  { header:"Fecha Creación",     key:"fecha_creacion",     width:20 },
];

const exportarFichasExcel = async (req, res) => {
  const idInstructor = req.usuario.rol === "instructor" ? req.usuario.id : null;
  const { estado, jornada } = req.query;
  const conditions = [];
  if (idInstructor) conditions.push(`f.id_instructor = ${idInstructor}`);
  if (estado) conditions.push(`f.estado = '${estado}'`);
  if (jornada) conditions.push(`f.jornada = '${jornada}'`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const q = `
    SELECT f.id, f.nombre, f.programa_formacion, f.jornada, f.estado, f.cupo_maximo,
      u.nombre AS instructor_nombre, f.ambiente_nombre, f.ambiente_nave,
      COUNT(fa.id_aprendiz) AS total_aprendices, f.fecha_creacion
    FROM ficha f
    LEFT JOIN usuario u ON f.id_instructor = u.id_usuario
    LEFT JOIN ficha_aprendiz fa ON fa.id_ficha = f.id
    ${where} GROUP BY f.id ORDER BY f.id DESC`;
  const [rows] = await db.query(q);
  generarExcelDiseño(res, rows, "Fichas", "fichas", COLS_FICHAS);
};

const exportarFichasCSV = async (req, res) => {
  const idInstructor = req.usuario.rol === "instructor" ? req.usuario.id : null;
  const { estado, jornada } = req.query;
  const conditions = [];
  if (idInstructor) conditions.push(`f.id_instructor = ${idInstructor}`);
  if (estado) conditions.push(`f.estado = '${estado}'`);
  if (jornada) conditions.push(`f.jornada = '${jornada}'`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const q = `
    SELECT f.id, f.nombre, f.programa_formacion, f.jornada, f.estado, f.cupo_maximo,
      u.nombre AS instructor_nombre, f.ambiente_nombre, f.ambiente_nave,
      COUNT(fa.id_aprendiz) AS total_aprendices, f.fecha_creacion
    FROM ficha f
    LEFT JOIN usuario u ON f.id_instructor = u.id_usuario
    LEFT JOIN ficha_aprendiz fa ON fa.id_ficha = f.id
    ${where} GROUP BY f.id ORDER BY f.id DESC`;
  const [rows] = await db.query(q);
  exportarCSVGenerico(res, rows, "fichas", COLS_FICHAS);
};
const exportarReportesExcel = async (req, res) => {
  const { rol, id } = req.usuario;
  const { estado_reporte } = req.query;
  const conditions = [];
  if (rol === "instructor") conditions.push(`r.id_instructor = ${id}`);
  if (estado_reporte) conditions.push(`r.estado_reporte = '${estado_reporte}'`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const esInstructor = rol === "instructor";
  const query = esInstructor
    ? `SELECT r.id_reporte, u.nombre AS aprendiz, u.correo AS correo_aprendiz,
              r.descripcion, r.estado_reporte, r.fecha_reporte
       FROM reportes r JOIN usuario u ON r.id_aprendiz = u.id_usuario
       ${where} ORDER BY r.fecha_reporte DESC`
    : `SELECT r.id_reporte, u.nombre AS aprendiz, u.correo AS correo_aprendiz,
              ui.nombre AS instructor, r.descripcion, r.estado_reporte, r.fecha_reporte
       FROM reportes r JOIN usuario u ON r.id_aprendiz = u.id_usuario
       LEFT JOIN usuario ui ON r.id_instructor = ui.id_usuario
       ${where} ORDER BY r.fecha_reporte DESC`;

  const [rows] = await db.query(query);

  const columnas = esInstructor ? [
    { header:"ID",          key:"id_reporte",      width:8  },
    { header:"Aprendiz",    key:"aprendiz",        width:24 },
    { header:"Correo",      key:"correo_aprendiz", width:30 },
    { header:"Descripción", key:"descripcion",     width:40 },
    { header:"Estado",      key:"estado_reporte",  width:16 },
    { header:"Fecha",       key:"fecha_reporte",   width:20 },
  ] : [
    { header:"ID",          key:"id_reporte",      width:8  },
    { header:"Aprendiz",    key:"aprendiz",        width:24 },
    { header:"Correo",      key:"correo_aprendiz", width:30 },
    { header:"Instructor",  key:"instructor",      width:24 },
    { header:"Descripción", key:"descripcion",     width:40 },
    { header:"Estado",      key:"estado_reporte",  width:16 },
    { header:"Fecha",       key:"fecha_reporte",   width:20 },
  ];

  generarExcelDiseño(res, rows, "Reportes", "reportes", columnas);
};

const exportarReportesCSV = async (req, res) => {
  const { rol, id } = req.usuario;
  const { estado_reporte } = req.query;
  const conditions = [];
  if (rol === "instructor") conditions.push(`r.id_instructor = ${id}`);
  if (estado_reporte) conditions.push(`r.estado_reporte = '${estado_reporte}'`);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const esInstructor = rol === "instructor";
  const query = esInstructor
    ? `SELECT r.id_reporte, u.nombre AS aprendiz, u.correo AS correo_aprendiz,
              r.descripcion, r.estado_reporte, r.fecha_reporte
       FROM reportes r JOIN usuario u ON r.id_aprendiz = u.id_usuario
       ${where} ORDER BY r.fecha_reporte DESC`
    : `SELECT r.id_reporte, u.nombre AS aprendiz, u.correo AS correo_aprendiz,
              ui.nombre AS instructor, r.descripcion, r.estado_reporte, r.fecha_reporte
       FROM reportes r JOIN usuario u ON r.id_aprendiz = u.id_usuario
       LEFT JOIN usuario ui ON r.id_instructor = ui.id_usuario
       ${where} ORDER BY r.fecha_reporte DESC`;

  const [rows] = await db.query(query);

  const columnas = esInstructor ? [
    { header:"ID",          key:"id_reporte",      width:8  },
    { header:"Aprendiz",    key:"aprendiz",        width:24 },
    { header:"Correo",      key:"correo_aprendiz", width:30 },
    { header:"Descripción", key:"descripcion",     width:40 },
    { header:"Estado",      key:"estado_reporte",  width:16 },
    { header:"Fecha",       key:"fecha_reporte",   width:20 },
  ] : [
    { header:"ID",          key:"id_reporte",      width:8  },
    { header:"Aprendiz",    key:"aprendiz",        width:24 },
    { header:"Correo",      key:"correo_aprendiz", width:30 },
    { header:"Instructor",  key:"instructor",      width:24 },
    { header:"Descripción", key:"descripcion",     width:40 },
    { header:"Estado",      key:"estado_reporte",  width:16 },
    { header:"Fecha",       key:"fecha_reporte",   width:20 },
  ];

  exportarCSVGenerico(res, rows, "reportes", columnas);
};

module.exports = {
  exportarPortatilesExcel, exportarPortatilesCSV,
  exportarUsuariosExcel,   exportarUsuariosCSV,
  exportarAmbientesExcel,  exportarAmbientesCSV,
  exportarFichasExcel,     exportarFichasCSV,
  exportarReportesExcel,   exportarReportesCSV,
  generarExcelDiseño,
};
