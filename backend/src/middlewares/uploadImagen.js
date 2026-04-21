const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
  const permitidos = ["image/jpeg", "image/png", "application/pdf"];
  if (permitidos.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Solo se permiten imágenes JPG, PNG o PDF"));
};

const uploadImagen = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
module.exports = uploadImagen;
