const nodemailer = require("nodemailer");

// Intentar con nodemailer primero, si falla usar Resend
const enviarCorreo = async (destinatario, asunto, htmlContent) => {
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
      console.log(`✅ Correo enviado a: ${destinatario}`);
      return;
    } catch (error) {
      console.error("❌ Error enviando correo (Resend):", error.message);
      return;
    }
  }

  // Fallback a nodemailer/Gmail
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Digital Hub" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: htmlContent,
    });
    console.log(`✅ Correo enviado a: ${destinatario}`);
  } catch (error) {
    console.error("❌ Error enviando correo:", error.message);
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
