const nodemailer = require("nodemailer");

// Intentar con Resend primero si está configurado, luego fallback a nodemailer/Gmail
const enviarCorreo = async (destinatario, asunto, htmlContent) => {
  console.log('📬 enviarCorreo: iniciando. RESEND_API_KEY set?', !!process.env.RESEND_API_KEY);

  // Si hay API key de Resend, usarla
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Digital Hub <onboarding@resend.dev>",
        to: destinatario,
        subject: asunto,
        html: htmlContent,
      });
      console.log(`✅ Correo enviado via Resend a: ${destinatario}`);
      return;
    } catch (error) {
      console.error("❌ Error enviando correo (Resend):", error && (error.stack || error.message || error));
      // continuar para intentar con nodemailer
    }
  }

  // Fallback a nodemailer/Gmail
  try {
    const userSet = !!process.env.EMAIL_USER;
    const passSet = !!process.env.EMAIL_PASS;
    console.log(`📬 Nodemailer fallback. EMAIL_USER set? ${userSet}. EMAIL_PASS set? ${passSet}`);

    if (!userSet || !passSet) {
      console.error('❌ No hay credenciales de correo configuradas en las variables de entorno (EMAIL_USER / EMAIL_PASS).');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verificar configuración del transporter
    try {
      await transporter.verify();
      console.log('🔎 Nodemailer transporter verificado correctamente');
    } catch (vErr) {
      console.error('❌ Nodemailer verify falló:', vErr && (vErr.stack || vErr.message || vErr));
    }

    await transporter.sendMail({
      from: `"Digital Hub" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: htmlContent,
    });
    console.log(`✅ Correo enviado via Gmail a: ${destinatario}`);
  } catch (error) {
    console.error("❌ Error enviando correo (nodemailer):", error && (error.stack || error.message || error));
  }
};

const enviarCodigoRecuperacion = async (correo, codigo, template) => {
  try {
    await enviarCorreo(
      correo,
      "Recuperación de contraseña - Digital Hub",
      template(codigo)
    );
  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error);
  }
};

module.exports = { enviarCorreo, enviarCodigoRecuperacion };
