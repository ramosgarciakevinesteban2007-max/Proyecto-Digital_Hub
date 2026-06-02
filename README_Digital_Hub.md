---
title: Digital Hub - README
---

DESCRIPCIÓN\
\
Digital Hub es una plataforma web desarrollada para apoyar la gestión y
administración de equipos tecnológicos dentro del SENA. El sistema
permite controlar el inventario de portátiles, gestionar usuarios,
fichas de formación, reportes e historial de cambios, facilitando la
trazabilidad y el control de los recursos tecnológicos.\
\
Además, incorpora funcionalidades de importación y exportación de datos
mediante archivos Excel, asignación de equipos a aprendices,
autenticación segura de usuarios y envío de notificaciones por correo
electrónico.\
\
CARACTERÍSTICAS PRINCIPALES\
\
• Gestión de usuarios con roles y permisos.\
• Registro, edición y eliminación de portátiles.\
• Asignación de equipos a aprendices.\
• Gestión de fichas de formación.\
• Gestión y seguimiento de reportes.\
• Historial de modificaciones de equipos.\
• Importación masiva de datos mediante Excel.\
• Exportación de información en formatos Excel y CSV.\
• Autenticación mediante JWT.\
• Envío de correos electrónicos automáticos.\
• Interfaz responsive para diferentes dispositivos.\
\
TECNOLOGÍAS UTILIZADAS\
\
Frontend:\
• React\
• Vite\
• React Router DOM\
• CSS\
\
Backend:\
• Node.js\
• Express.js\
• JWT\
• Bcrypt\
• Morgan\
• Multer\
• Nodemailer\
• Knex\
• MySQL2\
• Helmet\
• Cors\
• Dotenv\
• Nodemon\
\
Base de Datos:\
• MySQL\
\
Manejo de Archivos:\
• ExcelJS\
• Servicios de importación y exportación de Excel\
\
REQUISITOS PREVIOS\
\
• Node.js\
• npm\
• MySQL\
• Git\
\
INSTALACIÓN\
\
1. Clonar el repositorio.\
2. Ingresar al proyecto.\
3. Instalar dependencias del backend.\
4. Configurar el archivo .env.\
5. Ejecutar el backend con npm run dev.\
6. Instalar dependencias del frontend.\
7. Ejecutar el frontend con npm run dev.\
\
ROLES DEL SISTEMA\
\
Administrador:\
• Gestiona usuarios.\
• Gestiona portátiles.\
• Consulta historiales.\
• Administra reportes.\
• Importa y exporta información.\
\
Instructor:\
• Gestiona equipos.\
• Asigna portátiles a aprendices.\
• Gestiona reportes.\
\
Aprendiz:\
• Consulta equipos asignados.\
• Reporta novedades e incidencias.\
\
SEGURIDAD\
\
• Autenticación mediante JWT.\
• Contraseñas encriptadas con Bcrypt.\
• Control de acceso basado en roles.\
• Validación de datos en el servidor.\
• Protección de rutas mediante middleware.
