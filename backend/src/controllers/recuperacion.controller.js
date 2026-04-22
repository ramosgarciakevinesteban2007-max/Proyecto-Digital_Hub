const pool = require("../db/database");
const bcrypt = require("bcrypt");

const { enviarCodigoRecuperacion } = require("../services/email.service");
const { generarTemplateCodigo } = require("../services/templates/recuperacion.template");

// ===============================
// 1. ENVIAR CÓDIGO
// ===============================
const enviarCodigo = async (req, res) => {
  try {
    const { correo } = req.body;

    console.log("📨 Intentando enviar correo a:", correo);

    // 🔹 verificar si existe el usuario
    const [usuario] = await pool.query(
      "SELECT * FROM usuario WHERE correo = ?",
      [correo]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        mensaje: "Correo no registrado"
      });
    }

    // 🔹 generar código
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔹 expiración (5 minutos)
    const expiracion = new Date(Date.now() + 5 * 60 * 1000);

    // 🔹 guardar en DB
    await pool.query(
      `INSERT INTO recuperacion_contrasena (correo, codigo, expiracion) 
       VALUES (?, ?, ?)`,
      [correo, codigo, expiracion]
    );

    // 🔹 enviar correo
    await enviarCodigoRecuperacion(correo, codigo, generarTemplateCodigo);

    res.json({
      mensaje: "Código enviado al correo"
    });

  } catch (error) {
    console.error("🔥 ERROR BACKEND:", error);
    res.status(500).json({
      mensaje: "Error al enviar código"
    });
  }
};

// ===============================
// 2. VALIDAR CÓDIGO
// ===============================
const validarCodigo = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    const [rows] = await pool.query(
      `SELECT * FROM recuperacion_contrasena
       WHERE correo = ? AND codigo = ? AND usado = 0
       ORDER BY id DESC LIMIT 1`,
      [correo, codigo]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        mensaje: "Código inválido"
      });
    }

    const registro = rows[0];

    // 🔹 validar expiración
    if (new Date() > new Date(registro.expiracion)) {
      return res.status(400).json({
        mensaje: "Código expirado"
      });
    }

    res.json({
      mensaje: "Código válido"
    });

  } catch (error) {
    console.error("🔥 ERROR VALIDAR:", error);
    res.status(500).json({
      mensaje: "Error al validar código"
    });
  }
};

// ===============================
// 3. CAMBIAR CONTRASEÑA
// ===============================
const cambiarPassword = async (req, res) => {

  console.log("🚀 ENTRÓ A cambiarPassword");
  console.log("📥 BODY:", req.body);
  try {
    const { correo, codigo, nuevaPassword } = req.body;

    const [rows] = await pool.query(
      `SELECT * FROM recuperacion_contrasena
       WHERE correo = ? AND codigo = ? AND usado = 0
       ORDER BY id DESC LIMIT 1`,
      [correo, codigo]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        mensaje: "Código inválido"
      });
    }

    const registro = rows[0];

    if (new Date() > new Date(registro.expiracion)) {
      return res.status(400).json({
        mensaje: "Código expirado"
      });
    }

    // 🔐 encriptar nueva contraseña
    const hash = await bcrypt.hash(nuevaPassword, 10);

   const [resultado] = await pool.query(
  "UPDATE usuario SET password_hash = ? WHERE LOWER(correo) = LOWER(?)",
  [hash, correo]
);
console.log("🔎 Filas afectadas:", resultado.affectedRows);
console.log("🔐 Nuevo hash:", hash);
console.log("📧 Correo usado:", correo);

    // 🔹 marcar código como usado
    await pool.query(
      "UPDATE recuperacion_contrasena SET usado = 1 WHERE id = ?",
      [registro.id]
    );

    res.json({
      mensaje: "Contraseña actualizada correctamente"
    });

  } catch (error) {
    console.error("🔥 ERROR CAMBIAR PASSWORD:", error);
    res.status(500).json({
      mensaje: "Error al cambiar contraseña"
    });
  }
};

module.exports = {
  enviarCodigo,
  validarCodigo,
  cambiarPassword
};