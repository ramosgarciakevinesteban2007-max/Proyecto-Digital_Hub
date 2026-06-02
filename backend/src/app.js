const express = require("express");
const cors = require("cors");
const path = require("path");

// Cargar variables de entorno desde el backend/.env aun cuando se lance desde otra ruta
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// ===============================
// MIDDLEWARES GLOBALES
// ===============================
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ===============================
// ROUTERS
// ===============================
const usuarioRouter = require("./routers/usuario.routers");
const portatilRouter = require("./routers/portatil.routers");
const reportesRouter = require("./routers/reportes.routers");
const ambienteRouter = require("./routers/ambiente.routers");
const fichaRouter = require("./routers/ficha.routers");
const importacionRoutes = require("./routers/importacion.routers");
const exportacionRoutes = require("./routers/exportacion.routers");
const recuperacionRouter = require("./routers/recuperacion.routers");
const chatRouter = require("./routers/chat.routers");
const notificacionesRouter = require("./routers/notificaciones.routers");
const wompiRouter = require("./routes/wompi.routes");
// ===============================
// RUTAS PRINCIPALES (API)
// ===============================
app.use("/api/usuarios", usuarioRouter);
app.use("/api/portatiles", portatilRouter);
app.use("/api/reportes", reportesRouter);
app.use("/api/ambientes", ambienteRouter);
app.use("/api/fichas", fichaRouter);
app.use("/api/chat", chatRouter);
app.use("/api/notificaciones", notificacionesRouter);
app.use("/api/wompi", wompiRouter);
app.use("/importar", importacionRoutes);
app.use("/exportar", exportacionRoutes);
app.use("/api/recuperacion", recuperacionRouter);

// ===============================
// ARCHIVOS ESTÁTICOS
// ===============================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas legacy sin prefijo /api (compatibilidad con vite proxy)
app.use("/portatil",   portatilRouter);
app.use("/reportes",   reportesRouter);
app.use("/ambiente",   ambienteRouter);
app.use("/ficha",      fichaRouter);
app.use("/asignacion", require("./routers/asignacion.routers"));

// ===============================
// RUTA DE PRUEBA
// ===============================
app.get("/", (req, res) => {
    res.send("API DigitalHub funcionando 🚀");
});

// ===============================
// MANEJO DE ERRORES BÁSICO
// ===============================
app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });
});

// ===============================
// SERVIDOR
// ===============================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
