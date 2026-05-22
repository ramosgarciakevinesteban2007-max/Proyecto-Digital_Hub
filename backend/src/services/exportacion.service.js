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
  return v;
};

// ── Generador genérico con diseño oscuro ────────────────
const capitalizeWords = (s) => typeof s === 'string' ? s.split(/\s+/).map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : '').join(' ') : s;

const normalizeRowsForOutput = (rows) => rows.map(r => {
  const copy = { ...r };
  Object.keys(copy).forEach(k => {
    if (typeof copy[k] === 'string') copy[k] = capitalizeWords(copy[k]);
  });
  return copy;
});

const generarExcelDiseño = async (res, queryOrRows, titulo, nombreArchivo, columnas) => {
  try {
    let rows;
    if (Array.isArray(queryOrRows)) {
      rows = queryOrRows;
    } else if (typeof queryOrRows === 'object' && queryOrRows.sql) {
      const [r] = await db.query(queryOrRows.sql, queryOrRows.params || []);
      rows = r;
    } else {
      const [r] = await db.query(queryOrRows);
      rows = r;
    }
    // No modificamos la paleta ni el formato — solo normalizamos cadenas para exportación
    rows = normalizeRowsForOutput(rows);
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
      row.eachCell((cell, colNum) => {
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
const exportarCSVGenerico = async (res, query, nombreArchivo, columnas, encabezados) => {
  try {
    let rows;
    if (Array.isArray(query)) rows = query;
    else if (typeof query === 'object' && query.sql) {
      const [r] = await db.query(query.sql, query.params || []);
      rows = r;
    } else {
      const [r] = await db.query(query);
      rows = r;
    }
    // Normalizar cadenas antes de serializar
    rows = normalizeRowsForOutput(rows);
    let csv = "\uFEFF" + encabezados.join(",") + "\n";
    rows.forEach(row => {
      const fila = columnas.map(col => {
        let valor = row[col] != null ? row[col].toString() : "";
        valor = valor.replace(/"/g, '""');
        return (valor.includes(",") || valor.includes("\n")) ? `"${valor}"` : valor;
      }).join(",");
      csv += fila + "\n";
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error:"Error al exportar CSV" });
  }
};

// ── Exportadores específicos ────────────────────────────
const exportarPortatilesExcel = (req, res) => {
  const { buscar = '', estado = '', marca = '' } = req.query || {};
  const usuario = req.usuario || {};
  let sql = "SELECT * FROM portatil WHERE 1=1";
  const params = [];
  // Instructor solo ve los suyos
  if (usuario.rol === 'instructor') {
    sql += " AND id_instructor = ?";
    params.push(usuario.id);
  }
  if (buscar && buscar.toString().trim() !== '') {
    const b = `%${buscar.toString().toLowerCase()}%`;
    sql += " AND (LOWER(marca) LIKE ? OR LOWER(modelo) LIKE ? OR LOWER(num_serie) LIKE ?)";
    params.push(b, b, b);
  }
  if (marca && marca.toString().trim() !== '') {
    const m = `%${marca.toString().toLowerCase()}%`;
    sql += " AND LOWER(marca) LIKE ?";
    params.push(m);
  }
  if (estado && estado.toString().trim() !== '') { sql += " AND LOWER(estado) = ?"; params.push(estado.toString().toLowerCase()); }
  return generarExcelDiseño(res, { sql, params }, "Portátiles", "portatiles", [
    { header:"ID",          key:"id_portatil", width:8  },
    { header:"Serial",      key:"num_serie",   width:22 },
    { header:"Marca",       key:"marca",       width:18 },
    { header:"Tipo",        key:"tipo",        width:16 },
    { header:"Modelo",      key:"modelo",      width:20 },
    { header:"Estado",      key:"estado",      width:16 },
    { header:"Ubicación",   key:"ubicacion",   width:20 },
    { header:"Descripción", key:"descripcion", width:30 },
  ]);
};

const exportarPortatilesCSV = (req, res) => {
  const { buscar = '', estado = '', marca = '' } = req.query || {};
  const usuario = req.usuario || {};
  let sql = "SELECT * FROM portatil WHERE 1=1";
  const params = [];
  // Instructor solo ve los suyos
  if (usuario.rol === 'instructor') {
    sql += " AND id_instructor = ?";
    params.push(usuario.id);
  }
  if (buscar && buscar.toString().trim() !== '') {
    const b = `%${buscar.toString().toLowerCase()}%`;
    sql += " AND (LOWER(marca) LIKE ? OR LOWER(modelo) LIKE ? OR LOWER(num_serie) LIKE ?)";
    params.push(b, b, b);
  }
  if (marca && marca.toString().trim() !== '') {
    const m = `%${marca.toString().toLowerCase()}%`;
    sql += " AND LOWER(marca) LIKE ?";
    params.push(m);
  }
  if (estado && estado.toString().trim() !== '') { sql += " AND LOWER(estado) = ?"; params.push(estado.toString().toLowerCase()); }
  return exportarCSVGenerico(res, { sql, params }, "portatiles",
    ["id_portatil","marca","tipo","modelo","estado","num_serie","ubicacion","descripcion"],
    ["ID","Marca","Tipo","Modelo","Estado","Serial","Ubicación","Descripción"]
  );
};

const exportarUsuariosExcel = (req, res) => {
  const { buscar = '', rol = '', estado = '' } = req.query || {};
  let sql = "SELECT id_usuario, nombre, correo, rol, estado FROM usuario WHERE 1=1";
  const params = [];
  if (buscar && buscar.toString().trim() !== '') {
    const b = `%${buscar.toString().toLowerCase()}%`;
    sql += " AND (LOWER(nombre) LIKE ? OR LOWER(correo) LIKE ? OR CAST(id_usuario AS CHAR) LIKE ?)";
    params.push(b, b, `%${buscar}%`);
  }
  if (rol && rol.toString().trim() !== '') { sql += " AND LOWER(rol) = ?"; params.push(rol.toString().toLowerCase()); }
  if (estado && estado.toString().trim() !== '') { sql += " AND LOWER(estado) = ?"; params.push(estado.toString().toLowerCase()); }
  return generarExcelDiseño(res, { sql, params }, "Usuarios", "usuarios", [
    { header:"ID",      key:"id_usuario", width:8  },
    { header:"Nombre",  key:"nombre",     width:24 },
    { header:"Correo",  key:"correo",     width:30 },
    { header:"Rol",     key:"rol",        width:16 },
    { header:"Estado",  key:"estado",     width:16 },
  ]
);
};

const exportarUsuariosCSV = (req, res) => {
  const { buscar = '', rol = '', estado = '' } = req.query || {};
  let sql = "SELECT id_usuario, nombre, correo, rol, estado FROM usuario WHERE 1=1";
  const params = [];
  if (buscar && buscar.toString().trim() !== '') {
    const b = `%${buscar.toString().toLowerCase()}%`;
    sql += " AND (LOWER(nombre) LIKE ? OR LOWER(correo) LIKE ? OR CAST(id_usuario AS CHAR) LIKE ?)";
    params.push(b, b, `%${buscar}%`);
  }
  if (rol && rol.toString().trim() !== '') { sql += " AND LOWER(rol) = ?"; params.push(rol.toString().toLowerCase()); }
  if (estado && estado.toString().trim() !== '') { sql += " AND LOWER(estado) = ?"; params.push(estado.toString().toLowerCase()); }
  return exportarCSVGenerico(res, { sql, params }, "usuarios",
    ["id_usuario","nombre","correo","rol","estado"],
    ["ID","Nombre","Correo","Rol","Estado"]
  );
};

const exportarAmbientesExcel = (req, res) => generarExcelDiseño(res,
  "SELECT * FROM ambiente", "Ambientes", "ambientes", [
    { header:"ID",        key:"id_ambiente", width:8  },
    { header:"Nombre",    key:"nombre",      width:24 },
    { header:"Dirección", key:"direccion",   width:30 },
  ]
);

const exportarAmbientesCSV = (req, res) => exportarCSVGenerico(res,
  "SELECT * FROM ambiente", "ambientes",
  ["id_ambiente","nombre","direccion"],
  ["ID","Nombre","Dirección"]
);

const exportarFichasExcel = (req, res) => {
  const { buscar = '', estado = '', jornada = '', ambiente = '' } = req.query || {};
  let sql = "SELECT * FROM ficha WHERE 1=1";
  const params = [];
  if (buscar && buscar.toString().trim() !== '') {
    const b = `%${buscar.toString().toLowerCase()}%`;
    sql += " AND (LOWER(nombre) LIKE ? OR LOWER(programa_formacion) LIKE ?)";
    params.push(b, b);
  }
  if (estado && estado.toString().trim() !== '') { sql += " AND LOWER(estado) = ?"; params.push(estado.toString().toLowerCase()); }
  if (jornada && jornada.toString().trim() !== '') { sql += " AND LOWER(jornada) = ?"; params.push(jornada.toString().toLowerCase()); }
  if (ambiente && ambiente.toString().trim() !== '') { sql += " AND (LOWER(ambiente_nombre) LIKE ? OR LOWER(ambiente) LIKE ?)"; params.push(`%${ambiente.toString().toLowerCase()}%`, `%${ambiente.toString().toLowerCase()}%`); }
  return generarExcelDiseño(res, { sql, params }, "Fichas", "fichas", [
    { header:"ID",                  key:"id_ficha",            width:8  },
    { header:"Nombre",              key:"nombre",              width:24 },
    { header:"Programa Formación",  key:"programa_formacion",  width:28 },
    { header:"Jornada",             key:"jornada",             width:14 },
    { header:"ID Instructor",       key:"id_instructor",       width:14 },
    { header:"Cupo Máximo",         key:"cupo_maximo",         width:14 },
    { header:"Estado",              key:"estado",              width:14 },
    { header:"Fecha Creación",      key:"fecha_creacion",      width:20 },
  ]
);

};

const exportarFichasCSV = (req, res) => {
  const { buscar = '', estado = '', jornada = '', ambiente = '' } = req.query || {};
  let sql = "SELECT * FROM ficha WHERE 1=1";
  const params = [];
  if (buscar && buscar.toString().trim() !== '') {
    const b = `%${buscar.toString().toLowerCase()}%`;
    sql += " AND (LOWER(nombre) LIKE ? OR LOWER(programa_formacion) LIKE ?)";
    params.push(b, b);
  }
  if (estado && estado.toString().trim() !== '') { sql += " AND LOWER(estado) = ?"; params.push(estado.toString().toLowerCase()); }
  if (jornada && jornada.toString().trim() !== '') { sql += " AND LOWER(jornada) = ?"; params.push(jornada.toString().toLowerCase()); }
  if (ambiente && ambiente.toString().trim() !== '') { sql += " AND (LOWER(ambiente_nombre) LIKE ? OR LOWER(ambiente) LIKE ?)"; params.push(`%${ambiente.toString().toLowerCase()}%`, `%${ambiente.toString().toLowerCase()}%`); }
  return exportarCSVGenerico(res, { sql, params }, "fichas",
    ["id_ficha","nombre","programa_formacion","jornada","id_instructor","cupo_maximo","estado","fecha_creacion"],
    ["ID","Nombre","Programa Formación","Jornada","Instructor ID","Cupo Máximo","Estado","Fecha Creación"]
  );
};

module.exports = {
  exportarPortatilesExcel, exportarPortatilesCSV,
  exportarUsuariosExcel,   exportarUsuariosCSV,
  exportarAmbientesExcel,  exportarAmbientesCSV,
  exportarFichasExcel, exportarFichasCSV,
};
