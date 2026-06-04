const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const permitidos = ["image/jpeg", "image/png", "application/pdf"];
  if (permitidos.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Solo se permiten imágenes JPG, PNG o PDF"));
};

// Usar memoria en vez de disco (Render free no tiene disco persistente)
const uploadImagen = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
module.exports = uploadImagen;
