require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const hash = await bcrypt.hash('Admin123', 10);
  const [result] = await pool.query(
    "UPDATE usuario SET password_hash = ? WHERE correo = ?",
    [hash, 'nuevdsadaso@digitalhub.com']
  );

  if (result.affectedRows > 0) {
    console.log('✅ Contraseña actualizada correctamente');
    console.log('   Correo: nuevdsadaso@digitalhub.com');
    console.log('   Nueva contraseña: Admin123');
  } else {
    console.log('❌ No se encontró el usuario con ese correo');
  }

  await pool.end();
})();
