const express = require("express");
const router = express.Router();
const verificarToken = require("../middlewares/verificarToken");
const verificarRol = require("../middlewares/verificarRol");
const { ROLES } = require("../constants/dominio");
const { 
    exportarPortatilesExcel, exportarPortatilesCSV,
    exportarUsuariosExcel, exportarUsuariosCSV,
    exportarAmbientesExcel, exportarAmbientesCSV,
    exportarFichasExcel
} = require("../services/exportacion.service");

// PORTATILES
router.get("/portatiles/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarPortatilesExcel);
router.get("/portatiles/csv", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarPortatilesCSV);

// USUARIOS (Solo Admin y instructor)
router.get("/usuarios/excel", verificarToken, verificarRol([ROLES.ADMIN,ROLES.INSTRUCTOR]), exportarUsuariosExcel);
router.get("/usuarios/csv", verificarToken, verificarRol([ROLES.ADMIN,ROLES.INSTRUCTOR]), exportarUsuariosCSV);

// AMBIENTES
router.get("/ambientes/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarAmbientesExcel);
router.get("/ambientes/csv", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarAmbientesCSV);

// FICHAS
router.get("/fichas/excel", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), exportarFichasExcel);

// REPORTES POR FICHA
router.get("/reportes/ficha/:id", verificarToken, verificarRol([ROLES.ADMIN, ROLES.INSTRUCTOR]), async (req, res) => {
    const { generarExcelDiseño } = require("../services/exportacion.service");
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
    const db = require("../db/database");
    try {
        const [rows] = await db.query(
            `SELECT r.id_reporte, u.nombre AS aprendiz, r.descripcion, r.estado_reporte, r.fecha_reporte, r.archivo
             FROM reportes r
             JOIN usuario u ON r.id_aprendiz = u.id_usuario
             JOIN ficha_aprendiz fa ON fa.id_aprendiz = u.id_usuario
             WHERE fa.id_ficha = ?`, [id]
        );
        const [fichaRows] = await db.query("SELECT nombre FROM ficha WHERE id = ?", [id]);
        const nombreFicha = fichaRows[0]?.nombre || `Ficha ${id}`;
        // Reutilizar generarExcelDiseño pasando rows directamente
        const ExcelJS = require("exceljs");
        const columnas = [
            { header:"ID",          key:"id_reporte",      width:8  },
            { header:"Aprendiz",    key:"aprendiz",        width:24 },
            { header:"Descripción", key:"descripcion",     width:40 },
            { header:"Estado",      key:"estado_reporte",  width:16 },
            { header:"Fecha",       key:"fecha_reporte",   width:20 },
            { header:"Evidencia",   key:"archivo",         width:24 },
        ];
        const limpiar = v => {
            if (v instanceof Date) return v.toISOString().split("T")[0];
            if (v === null || v === undefined) return "";
            return v;
        };
        const C = { bg1:"FF0A0A0F", bg2:"FF160B2E", bg3:"FF1A0F35", card:"FF241545", purple:"FF7F5AF0", purpleL:"FFC9A8FF", text:"FFF0EAFF", muted:"FFB8A8D8" };
        const fill = a => ({ type:"pattern", pattern:"solid", fgColor:{ argb:a } });
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Reportes", { views:[{ showGridLines:false }] });
        ws.columns = columnas.map(c => ({ width: c.width || 22 }));
        const lastCol = String.fromCharCode(64 + columnas.length);
        ws.getRow(1).height = 48; ws.mergeCells(`A1:${lastCol}1`); ws.getCell("A1").fill = fill(C.bg1);
        ws.getRow(2).height = 38; ws.mergeCells(`A2:${lastCol}2`);
        const t = ws.getCell("A2"); t.value = `DIGITAL HUB — Reportes: ${nombreFicha}`; t.font = { size:16, bold:true, color:{ argb:C.purpleL } }; t.fill = fill(C.bg1); t.alignment = { horizontal:"center", vertical:"middle" };
        ws.getRow(3).height = 22; ws.mergeCells(`A3:${lastCol}3`);
        const s = ws.getCell("A3"); s.value = `Generado el ${new Date().toLocaleDateString("es-CO",{year:"numeric",month:"long",day:"numeric"})}   ·   Total: ${rows.length} reportes`; s.font = { italic:true, size:10, color:{ argb:C.muted } }; s.fill = fill(C.bg2); s.alignment = { horizontal:"center", vertical:"middle" };
        ws.getRow(4).height = 4; for(let c=1;c<=columnas.length;c++) ws.getCell(4,c).fill = fill(C.purple);
        ws.getRow(5).height = 28;
        columnas.forEach((col,i) => { const c = ws.getCell(5,i+1); c.value=col.header; c.font={bold:true,size:11,color:{argb:C.text}}; c.fill=fill(C.card); c.alignment={horizontal:"center",vertical:"middle"}; c.border={bottom:{style:"medium",color:{argb:C.purple}}}; });
        rows.forEach((item,idx) => {
            const valores = columnas.map(col => limpiar(item[col.key]));
            const row = ws.addRow(valores); row.height = 22;
            const rowBg = idx%2===0 ? C.bg3 : C.bg2;
            row.eachCell(cell => { cell.fill=fill(rowBg); cell.font={size:10,color:{argb:C.text}}; cell.alignment={horizontal:"center",vertical:"middle"}; cell.border={bottom:{style:"thin",color:{argb:C.card}}}; });
        });
        const buffer = await wb.xlsx.writeBuffer();
        res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition",`attachment; filename="reportes_ficha_${id}.xlsx"`);
        res.setHeader("Content-Length", buffer.byteLength);
        res.end(buffer);
    } catch(e) { console.error(e); res.status(500).json({ error:"Error al exportar" }); }
});

module.exports = router;