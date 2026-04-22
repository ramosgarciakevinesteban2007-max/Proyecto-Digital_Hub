const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const C = {
  bg1:"FF0A0A0F", bg2:"FF160B2E", bg3:"FF1A0F35", card:"FF241545",
  purple:"FF7F5AF0", purpleL:"FFC9A8FF", text:"FFF0EAFF", muted:"FFB8A8D8",
  yellow:"FFFACC15", orange:"FFFB923C", green:"FF4ADE80",
  yBg:"FF2A2010", oBg:"FF251A10", gBg:"FF0F2A1A",
};
const fill  = a => ({ type:"pattern", pattern:"solid", fgColor:{ argb:a } });
const fnt   = o => o;
const aln   = (h,v="middle") => ({ horizontal:h, vertical:v });
const hline = (ws, row, cols, color) => {
  ws.getRow(row).height = 4;
  for (let c=1;c<=cols;c++) ws.getCell(row,c).fill = fill(color);
};

const generarExcelReportes = async (data) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "DigitalHub"; wb.created = new Date();

  const COLS = 5;
  const BAR_COLS = 22; // columnas para la barra en hoja 2

  // ══════════════════════════════════════════
  //  HOJA 1 — REPORTES
  // ══════════════════════════════════════════
  const ws = wb.addWorksheet("Reportes",{
    pageSetup:{ paperSize:9, orientation:"landscape", fitToPage:true, fitToWidth:1 },
    properties:{ tabColor:{ argb:C.purple } },
    views:[{ showGridLines:false }],
  });

  ws.columns = [
    { width:8  },  // A ID
    { width:20 },  // B Estado
    { width:22 },  // C Fecha
    { width:30 },  // D Evidencia
    { width:60 },  // E Descripción
  ];

  // Fila 1 — Cabecera
  ws.getRow(1).height = 48;
  ws.mergeCells("A1:E1");
  ws.getCell("A1").fill = fill(C.bg1);
  ws.getCell("A1").alignment = aln("center");

  // Fila 2 — Título
  ws.getRow(2).height = 38;
  ws.mergeCells("A2:E2");
  const t1 = ws.getCell("A2");
  t1.value     = "DIGITAL HUB — Reporte de Incidencias";
  t1.font      = fnt({ size:18, bold:true, color:{ argb:C.purpleL } });
  t1.fill      = fill(C.bg1);
  t1.alignment = aln("center");

  // Fila 3 — Subtítulo
  ws.getRow(3).height = 22;
  ws.mergeCells("A3:E3");
  const s1 = ws.getCell("A3");
  s1.value     = `Generado el ${new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"})}   ·   Total: ${data.length} reportes`;
  s1.font      = fnt({ italic:true, size:10, color:{ argb:C.muted } });
  s1.fill      = fill(C.bg2);
  s1.alignment = aln("center");

  // Fila 4 — línea púrpura
  hline(ws, 4, COLS, C.purple);

  // Fila 5 — Encabezados
  ws.getRow(5).height = 28;
  ["ID","Estado","Fecha","Evidencia","Descripción"].forEach((h,i) => {
    const c = ws.getCell(5, i+1);
    c.value     = h;
    c.font      = fnt({ bold:true, size:11, color:{ argb:C.text } });
    c.fill      = fill(C.card);
    c.alignment = aln("center");
    c.border    = { bottom:{ style:"medium", color:{ argb:C.purple } } };
  });

  // Filas de datos
  const eCfg = {
    pendiente:  { bg:C.yBg, text:C.yellow },
    en_revision:{ bg:C.oBg, text:C.orange },
    resuelto:   { bg:C.gBg, text:C.green  },
  };

    const uploadsDir = path.join(__dirname, '../uploads');

    data.forEach((item, idx) => {
      const estado = item.estado_reporte || "";
      let fecha = "";
      if (item.fecha_reporte && item.fecha_reporte !== "0000-00-00 00:00:00" && !isNaN(new Date(item.fecha_reporte))) {
        const d = new Date(item.fecha_reporte);
        fecha = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
      }

      const archivoPath = item.archivo ? path.join(uploadsDir, item.archivo) : null;
      const tieneImagen = archivoPath && fs.existsSync(archivoPath) && /\.(jpg|jpeg|png)$/i.test(item.archivo);

      const row = ws.addRow([item.id_reporte ?? "", estado, fecha, tieneImagen ? "" : (item.archivo ? "Ver adjunto" : "Sin evidencia"), item.descripcion || ""]);
      row.height = tieneImagen ? 80 : 22;
      const rowBg = idx%2===0 ? C.bg3 : C.bg2;
      const cfg   = eCfg[estado] || { bg:rowBg, text:C.text };
      row.eachCell((c,col) => {
        c.fill      = fill(col===2 ? cfg.bg : rowBg);
        c.font      = fnt({ size:10, color:{ argb:col===2 ? cfg.text : C.text }, bold:col===2 });
        c.alignment = { vertical:"middle", horizontal:col===5?"left":"center", wrapText:col===5 };
        c.border    = { bottom:{ style:"thin", color:{ argb:C.card } } };
      });

      if (tieneImagen) {
        try {
          const ext = item.archivo.split('.').pop().toLowerCase();
          const imgType = ext === 'png' ? 'png' : 'jpeg';
          const imgId = wb.addImage({ filename: archivoPath, extension: imgType });
          const rowNum = row.number;
          ws.addImage(imgId, {
            tl: { col: 3, row: rowNum - 1 },
            br: { col: 4, row: rowNum },
            editAs: 'oneCell',
          });
        } catch(e) { console.error('Error imagen Excel:', e.message); }
      }
    });

  ws.views = [{ state:"frozen", ySplit:4, showGridLines:false }];

  // ══════════════════════════════════════════
  //  HOJA 2 — ESTADÍSTICAS
  // ══════════════════════════════════════════
  const ws2 = wb.addWorksheet("Estadísticas",{
    properties:{ tabColor:{ argb:C.green } },
    views:[{ showGridLines:false }],
  });

  // 22 columnas de barra + etiqueta + valor
  ws2.columns = [
    { width:16 },              // A etiqueta
    ...Array(20).fill({ width:2.2 }), // B-U barra
    { width:2  },              // V espacio
    { width:16 },              // W valor+pct
  ];

  const pendientes = data.filter(r=>r.estado_reporte==="pendiente").length;
  const revision   = data.filter(r=>r.estado_reporte==="en_revision").length;
  const resueltos  = data.filter(r=>r.estado_reporte==="resuelto").length;
  const total      = data.length;
  const pct        = n => total>0 ? Math.round((n/total)*100) : 0;

  // Fila 1 — Cabecera hoja 2
  ws2.getRow(1).height = 48;
  ws2.mergeCells("A1:W1");
  ws2.getCell("A1").fill = fill(C.bg1);

  // Fila 2 — Título
  ws2.getRow(2).height = 38;
  ws2.mergeCells("A2:W2");
  const t2 = ws2.getCell("A2");
  t2.value     = "DIGITAL HUB — Estadísticas de Reportes";
  t2.font      = fnt({ size:16, bold:true, color:{ argb:C.purpleL } });
  t2.fill      = fill(C.bg1);
  t2.alignment = aln("center");

  // Fila 3 — Subtítulo
  ws2.getRow(3).height = 22;
  ws2.mergeCells("A3:W3");
  const s2 = ws2.getCell("A3");
  s2.value     = `${new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"})}   ·   ${total} reportes en total`;
  s2.font      = fnt({ italic:true, size:10, color:{ argb:C.muted } });
  s2.fill      = fill(C.bg2);
  s2.alignment = aln("center");

  // Fila 4 — línea púrpura
  hline(ws2, 4, 23, C.purple);

  // Fila 5 — Título sección
  ws2.getRow(5).height = 24;
  ws2.mergeCells("A5:W5");
  const sec = ws2.getCell("A5");
  sec.value     = "DISTRIBUCIÓN DE REPORTES POR ESTADO";
  sec.font      = fnt({ bold:true, size:11, color:{ argb:C.purpleL } });
  sec.fill      = fill(C.card);
  sec.alignment = aln("center");

  // Fila 6 — Encabezados
  ws2.getRow(6).height = 20;
  for (let c=1;c<=23;c++) ws2.getCell(6,c).fill = fill(C.bg2);
  const hA = ws2.getCell(6,1);
  hA.value = "Estado"; hA.font = fnt({ bold:true, size:10, color:{ argb:C.muted } }); hA.alignment = aln("left");
  const hW = ws2.getCell(5,22);
  hW.value = "Total (%)"; hW.font = fnt({ bold:true, size:10, color:{ argb:C.muted } }); hW.alignment = aln("center");

  // Filas de barras
  const barData = [
    { label:"Pendiente",   n:pendientes, active:C.yellow, inactive:C.yBg },
    { label:"En revisión", n:revision,   active:C.orange, inactive:C.oBg },
    { label:"Resuelto",    n:resueltos,  active:C.green,  inactive:C.gBg },
  ];

  barData.forEach((bar, i) => {
    const r = 6 + i*4;
    // Espaciado superior
    ws2.getRow(r).height = 8;
    for (let c=1;c<=23;c++) ws2.getCell(r,c).fill = fill(C.bg3);

    // Fila de barra
    ws2.getRow(r+1).height = 28;
    const blocks = total>0 ? Math.round((bar.n/total)*20) : 0;

    // Etiqueta
    const lbl = ws2.getCell(r+1,1);
    lbl.value     = bar.label;
    lbl.font      = fnt({ bold:true, size:12, color:{ argb:bar.active } });
    lbl.fill      = fill(C.bg3);
    lbl.alignment = aln("left");

    // Bloques barra (cols 2-21)
    for (let b=0;b<20;b++) {
      const c = ws2.getCell(r+1, b+2);
      c.fill = fill(b < blocks ? bar.active : bar.inactive);
    }

    // Espacio col 22
    ws2.getCell(r+1,22).fill = fill(C.bg3);

    // Valor + porcentaje
    const val = ws2.getCell(r+1,23);
    val.value     = `${bar.n}  (${pct(bar.n)}%)`;
    val.font      = fnt({ bold:true, size:12, color:{ argb:bar.active } });
    val.fill      = fill(C.bg3);
    val.alignment = aln("center");

    // Espaciado inferior
    ws2.getRow(r+2).height = 8;
    for (let c=1;c<=23;c++) ws2.getCell(r+2,c).fill = fill(C.bg3);

    // Separador fino
    ws2.getRow(r+3).height = 2;
    for (let c=1;c<=23;c++) ws2.getCell(r+3,c).fill = fill(C.card);
  });

  // Fila total
  const totR = 6 + barData.length*4 + 1;
  hline(ws2, totR, 23, C.purple);
  ws2.getRow(totR+1).height = 28;
  for (let c=1;c<=23;c++) ws2.getCell(totR+1,c).fill = fill(C.card);
  const totLbl = ws2.getCell(totR+1,1);
  totLbl.value     = "TOTAL";
  totLbl.font      = fnt({ bold:true, size:13, color:{ argb:C.purpleL } });
  totLbl.alignment = aln("left");
  const totVal = ws2.getCell(totR+1,23);
  totVal.value     = `${total}  (100%)`;
  totVal.font      = fnt({ bold:true, size:13, color:{ argb:C.purpleL } });
  totVal.alignment = aln("center");

  return wb;
};

module.exports = { generarExcelReportes };
