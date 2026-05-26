const db = require("../db/database");
const { generarExcelReportes } = require("../services/excel.service");
const ExcelJS = require("exceljs");

const exportarReportesExcel = async (req, res) => {
    try {
        // Permitir filtros: buscar (texto) y estado
        const { buscar = '', estado = '' } = req.query;
        let sql = `SELECT r.*, u.nombre AS nombre_aprendiz, u.correo AS correo_aprendiz
                   FROM reportes r
                   LEFT JOIN usuario u ON r.id_aprendiz = u.id_usuario
                   WHERE 1=1`;
        const params = [];
        if (buscar && buscar.toString().trim() !== '') {
            const b = `%${buscar.toString().toLowerCase()}%`;
            sql += ` AND (LOWER(r.descripcion) LIKE ? OR LOWER(u.nombre) LIKE ? OR CAST(r.id_reporte AS CHAR) LIKE ?)`;
            params.push(b, b, `%${buscar}%`);
        }
        if (estado && estado.toString().trim() !== '') {
            sql += ` AND r.estado_reporte = ?`;
            params.push(estado);
        }

        const [rows] = await db.query(sql, params);

        // Capitalizar cadenas en la salida (no modificar la BD)
        const capitalize = s => typeof s === 'string' ? s.split(/\s+/).map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : '').join(' ') : s;
        const normalized = rows.map(r => {
            const copy = { ...r };
            Object.keys(copy).forEach(k => { if (typeof copy[k] === 'string') copy[k] = capitalize(copy[k]); });
            return copy;
        });

        const workbook = await generarExcelReportes(normalized);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reportes.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al exportar reportes",
            error
        });
    }
};

const importarReportesExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ mensaje: "No se envió ningún archivo" });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const worksheet = workbook.worksheets[0]; // Primera hoja

        const reportes = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezados

            const estado_reporte = row.getCell(1).value?.toString().trim();
            const fecha_reporte  = row.getCell(2).value;
            const descripcion    = row.getCell(3).value?.toString().trim();

            // Validaciones básicas
            if (!estado_reporte || !fecha_reporte || !descripcion) return;

            reportes.push([estado_reporte, fecha_reporte, descripcion]);
        });

        if (reportes.length === 0) {
            return res.status(400).json({ mensaje: "El archivo no tiene datos válidos" });
        }

        // Insertar todos en la BD
        await Promise.all(
            reportes.map(r =>
                db.query(
                    "INSERT INTO reportes (estado_reporte, fecha_reporte, descripcion) VALUES (?, ?, ?)",
                    r
                )
            )
        );

        res.json({ mensaje: `${reportes.length} reportes importados correctamente` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al importar reportes", error });
    }
};

const exportarReportesCSV = async (req, res) => {
    try {
        const { buscar = '', estado = '' } = req.query;
        let sql = `SELECT r.*, u.nombre AS nombre_aprendiz, u.correo AS correo_aprendiz
                   FROM reportes r
                   LEFT JOIN usuario u ON r.id_aprendiz = u.id_usuario
                   WHERE 1=1`;
        const params = [];
        if (buscar && buscar.toString().trim() !== '') {
            const b = `%${buscar.toString().toLowerCase()}%`;
            sql += ` AND (LOWER(r.descripcion) LIKE ? OR LOWER(u.nombre) LIKE ? OR CAST(r.id_reporte AS CHAR) LIKE ?)`;
            params.push(b, b, `%${buscar}%`);
        }
        if (estado && estado.toString().trim() !== '') {
            sql += ` AND r.estado_reporte = ?`;
            params.push(estado);
        }

        const [rows] = await db.query(sql, params);
        const capitalize = s => typeof s === 'string' ? s.split(/\s+/).map(w => w ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : '').join(' ') : s;
        const normalized = rows.map(r => { const copy = { ...r }; Object.keys(copy).forEach(k => { if (typeof copy[k] === 'string') copy[k] = capitalize(copy[k]); }); return copy; });

        const headers = ["ID","Aprendiz","Descripción","Estado","Fecha","Evidencia"];
        let csv = "\uFEFF" + headers.join(',') + '\n';
        normalized.forEach(row => {
            const fecha = row.fecha_reporte && !isNaN(new Date(row.fecha_reporte)) ? (new Date(row.fecha_reporte)).toISOString().split('T')[0] : (row.fecha_reporte || '');
            const cols = [row.id_reporte ?? '', row.nombre_aprendiz ?? '', (row.descripcion||'').replace(/"/g,'""'), row.estado_reporte ?? '', fecha, row.archivo || ''];
            const line = cols.map(c => (c||'').toString().includes(',') || (c||'').toString().includes('\n') ? '"'+(c||'').toString().replace(/"/g,'""')+'"' : (c||'').toString()).join(',');
            csv += line + '\n';
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="reportes.csv"`);
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al exportar reportes CSV', error });
    }
};

module.exports = { exportarReportesExcel, importarReportesExcel, exportarReportesCSV };