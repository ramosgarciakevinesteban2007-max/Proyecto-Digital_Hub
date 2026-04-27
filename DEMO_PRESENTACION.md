# 🎯 DEMO — DigitalHub
### Sistema de Gestión de Equipos y Fichas de Formación — SENA

---

## 👥 DISTRIBUCIÓN DEL DEMO (5 personas)

| Persona | Rol | Qué muestra |
|---------|-----|-------------|
| **P1** | Presentador general | Intro, arquitectura, landing |
| **P2** | Admin | Panel admin, usuarios, equipos |
| **P3** | Instructor | Fichas, asignación, reportes |
| **P4** | Aprendiz | Mi ficha, mi dispositivo, reportes |
| **P5** | Técnico | Backend, BD, seguridad, cierre |

---

## ⏱️ GUIÓN COMPLETO (~8 minutos en vivo + demo)

---

### 🟣 PARTE 1 — INTRODUCCIÓN (P1) — 1 min

**Qué decir:**
> "DigitalHub es un sistema web desarrollado para el SENA que permite gestionar portátiles, fichas de formación y aprendices desde un solo lugar. Tiene tres roles: Administrador, Instructor y Aprendiz, cada uno con su propio panel."

**Mostrar:**
- Abrir `http://localhost:3000`
- La landing page con las secciones: hero, características, cómo funciona
- Señalar el botón "Iniciar sesión" y "Registrarse"

**Puntos clave a mencionar:**
- Stack: React + Node.js + Express + MySQL
- Autenticación con JWT
- Tema oscuro y claro switcheable
- Diseño responsivo

---

### 🔴 PARTE 2 — ROL ADMINISTRADOR (P2) — 2 min

**Credenciales de prueba:**
```
correo: admin@digitalhub.com
password: (la que tengan configurada)
```

**Flujo a mostrar:**

1. **Login** → entrar como admin
2. **Dashboard** → mostrar las métricas: total equipos, fichas activas, usuarios
3. **Gestión de Usuarios** (`/admin/usuarios`)
   - Mostrar la lista de usuarios
   - Filtrar por rol (instructor / aprendiz)
   - Mostrar botón de activar/desactivar
4. **Gestión de Equipos** (`/admin/equipos`)
   - Mostrar tabla con filtros (estado, marca)
   - Añadir un portátil nuevo en vivo
   - Exportar a Excel
5. **Fichas** (`/admin/fichas`)
   - Ver fichas activas
   - Entrar al detalle de una ficha → ver aprendices, dispositivos, reportes
6. **Papelera** (`/admin/papelera`)
   - Mostrar equipos dañados/en mantenimiento
   - Restaurar uno

**Frase de cierre P2:**
> "El administrador tiene visibilidad total del sistema y puede gestionar todos los recursos."

---

### 🟡 PARTE 3 — ROL INSTRUCTOR (P3) — 2 min

**Credenciales de prueba:**
```
correo: instructor@digitalhub.com
password: (la que tengan configurada)
```

**Flujo a mostrar:**

1. **Login** → entrar como instructor
2. **Dashboard instructor** → ver sus fichas, equipos y reportes pendientes
3. **Mis Fichas** (`/instructor/fichas`)
   - Crear una ficha nueva en vivo (número, programa, jornada, cupo)
   - Entrar al detalle de la ficha
   - Asignar un aprendiz por correo
   - Ver la pestaña de **Chat** → enviar un mensaje
4. **Equipos** (`/instructor/equipos`)
   - Registrar un portátil nuevo
   - Asignar el portátil a un aprendiz
   - Mandar uno a la papelera (botón 🗑️)
5. **Reportes** (`/instructor/reportes`)
   - Ver reportes de sus aprendices
   - Cambiar estado de un reporte a "en revisión"

**Frase de cierre P3:**
> "El instructor gestiona sus propias fichas y equipos, y se comunica con sus aprendices en tiempo real."

---

### 🟢 PARTE 4 — ROL APRENDIZ (P4) — 1.5 min

**Credenciales de prueba:**
```
correo: aprendiz@digitalhub.com
password: (la que tengan configurada)
```

**Flujo a mostrar:**

1. **Login** → entrar como aprendiz
2. **Dashboard aprendiz** → ver su ficha asignada y equipo
3. **Mi Ficha** (`/aprendiz/ficha`)
   - Ver la ficha a la que pertenece
   - Abrir el **Chat** → responder el mensaje del instructor
4. **Mi Dispositivo** (`/aprendiz/dispositivo`)
   - Ver el portátil asignado
   - Crear un reporte de daño con descripción e imagen
5. **Historial** (`/aprendiz/historial`)
   - Ver todos sus reportes con filtro por estado y fecha
6. **Notificaciones** → mostrar que llegó notificación de asignación de equipo

**Frase de cierre P4:**
> "El aprendiz tiene una vista simplificada centrada en su ficha, su equipo y sus reportes."

---

### ⚙️ PARTE 5 — BACKEND Y SEGURIDAD (P5) — 1.5 min

**Qué mostrar (sin abrir código, solo explicar con el sistema abierto):**

1. **Arquitectura** (explicar de memoria o con diagrama):
   ```
   Frontend (React + Vite)  →  Proxy  →  Backend (Node + Express)  →  MySQL
   ```

2. **Seguridad implementada:**
   - Contraseñas cifradas con **bcrypt**
   - Autenticación con **JWT** (expira en 2h)
   - Roles verificados en cada endpoint del backend
   - Consultas parametrizadas (protección SQL Injection)
   - Variables de entorno en `.env`

3. **Funcionalidades técnicas destacadas:**
   - Importación masiva de datos desde **CSV/Excel**
   - Exportación a **Excel** de equipos, fichas, usuarios
   - Envío de **correos automáticos** al asignar equipos o fichas
   - **Notificaciones internas** en tiempo real (polling cada 5s)
   - **Chat grupal** por ficha entre instructor y aprendices
   - **Recuperación de contraseña** por correo con código de 6 dígitos

4. **Base de datos** — mencionar las tablas principales:
   - `usuario`, `ficha`, `ficha_aprendiz`, `portatil`, `portatil_aprendiz`
   - `reportes`, `chat_ficha`, `notificaciones`, `ambiente`

5. **Tema claro/oscuro** — hacer el switch en ajustes en vivo

**Frase de cierre P5:**
> "El sistema está construido con buenas prácticas de seguridad, separación de responsabilidades y pensado para escalar."

---

## 🎤 CIERRE GENERAL (P1) — 30 seg

> "DigitalHub resuelve un problema real del SENA: el control manual y desorganizado de portátiles y fichas. Con este sistema, instructores y aprendices tienen todo centralizado, con trazabilidad completa y comunicación integrada. Gracias."

---

## 📋 CHECKLIST ANTES DEL DEMO

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Base de datos con datos de prueba cargados
- [ ] Tener credenciales de los 3 roles a mano
- [ ] Tener un archivo CSV/Excel listo para mostrar importación
- [ ] Tener una imagen lista para subir en el reporte del aprendiz
- [ ] Navegador con zoom al 90% para que se vea más contenido
- [ ] Cerrar otras pestañas para no distraer

---

## 🚨 PREGUNTAS FRECUENTES QUE PUEDEN HACER

**¿Por qué usaron JWT y no sesiones?**
> JWT es stateless, no requiere almacenamiento en servidor y es ideal para APIs REST.

**¿Cómo protegen contra SQL Injection?**
> Usamos consultas parametrizadas con `?` en MySQL2, nunca concatenamos strings directamente.

**¿Qué pasa si el token expira?**
> El sistema redirige automáticamente al login cuando el backend responde 401.

**¿El chat es en tiempo real?**
> Usa polling cada 5 segundos. No es WebSocket pero es funcional para el caso de uso.

**¿Por qué soft delete en fichas y no en equipos?**
> Las fichas tienen historial de aprendices que debe conservarse. Los equipos van a la papelera cambiando su estado a "dañado".

**¿Cómo escalaría el sistema?**
> Se podría agregar WebSockets para el chat, caché con Redis para notificaciones, y desplegar en contenedores Docker.

---

## 💡 TIPS PARA LA PRESENTACIÓN

- Hablen despacio y con seguridad
- Si algo falla en vivo, digan "esto lo mostramos en el video demo" y sigan
- Cada persona debe conocer su parte de memoria, no leer
- El demo en vivo debe durar máximo 5 minutos, el resto es explicación
- Tengan el video de respaldo grabado por si hay problemas técnicos
