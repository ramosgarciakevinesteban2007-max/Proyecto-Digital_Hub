# Lista de Chequeo — Proyecto Formativo de Analisis y Desarrollo de Software

---

## 1. Documentación del Proyecto

- [ ] **Ficha del proyecto**: nombre, descripción general, objetivo, alcance y limitaciones
- [ ] **Planteamiento del problema**: justificación y contexto del problema que resuelve
- [ ] **Objetivos**: objetivo general y objetivos específicos redactados con verbos en infinitivo
- [ ] **Justificación**: impacto social, empresarial o académico del proyecto
- [ ] **Alcance y limitaciones**: qué incluye y qué no incluye el sistema
- [ ] **Cronograma de actividades**: diagrama de Gantt o tabla con fases y fechas
- [ ] **Presupuesto estimado**: recursos humanos, tecnológicos y económicos
- [ ] **Roles del equipo**: nombre, cargo y responsabilidades de cada integrante
- [ ] **Actas de reunión**: registro de sesiones de trabajo y decisiones tomadas (opcional)

---

## 2. Análisis y Diseño del Sistema

- [ ] **Levantamiento de requerimientos**: entrevistas, encuestas o historias de usuario
- [ ] **Requerimientos funcionales**: listado numerado con descripción clara
- [ ] **Requerimientos no funcionales**: rendimiento, seguridad, usabilidad, escalabilidad
- [ ] **Diagrama de casos de uso**: actores e interacciones con el sistema
- [ ] **Diagrama de clases o modelo de dominio**
- [ ] **Diagrama Entidad-Relación (ER)** o modelo relacional de base de datos
- [ ] **Diagrama de flujo de procesos principales**
- [ ] **Diagrama de arquitectura del sistema** (capas, servicios, componentes)
- [ ] **Wireframes o mockups** de las principales pantallas (Figma, Balsamiq, etc.)
- [ ] **Prototipo navegable** (opcional)
- [ ] **Modelo C4 o diagrama de despliegue** (opcional)

---

## 3. Base de Datos

- [ ] **Script de creación de la base de datos** (DDL: CREATE, ALTER, etc.)
- [ ] **Script de datos de prueba** (DML: INSERT con datos representativos)
- [ ] **Normalización**: al menos hasta Tercera Forma Normal (3FN)
- [ ] **Diagrama de la base de datos** con llaves primarias y foráneas
- [ ] **Vistas, procedimientos almacenados o funciones** (si aplica)
- [ ] **Copias de seguridad (backup)**: mecanismo de respaldo documentado
- [ ] **Índices** en campos de búsqueda frecuente para optimización

---

## 4. Desarrollo del Software

### 4.1 Funcionalidades Básicas
- [ ] **CRUDs completos** sobre las entidades principales (Crear, Leer, Actualizar, Eliminar), Eliminar debe ser borrado lógico mayormente (soft delete)
- [ ] **Búsqueda y filtrado** de registros con múltiples criterios
- [ ] **Paginación** en listados con gran volumen de datos
- [ ] **Validaciones en frontend y backend** (campos requeridos, formatos, rangos)

### 4.2 Autenticación y Autorización
- [ ] **Registro de usuarios** con confirmación
- [ ] **Inicio y cierre de sesión** (login / logout)
- [ ] **Roles y permisos**: al menos dos roles diferenciados (ej. administrador y usuario)
- [ ] **Recuperación de contraseña** (correo de restablecimiento o pregunta secreta)
- [ ] **Control de acceso por rol** a módulos y funcionalidades
- [ ] **Sesiones con tiempo de expiración**

### 4.3 Panel de Administrador
- [ ] **Dashboard con métricas e indicadores clave** (KPIs del negocio)
- [ ] **Gestión de usuarios**: crear, editar, activar/desactivar, eliminar
- [ ] **Asignación y modificación de roles**
- [ ] **Auditoría / bitácora de acciones**: registro de quién hizo qué y cuándo
- [ ] **Configuración general del sistema** (parámetros, datos de la empresa, etc.)

### 4.4 Gestión de Archivos e Integración con Excel/CSV
- [ ] **Carga masiva de datos** desde archivo `.xlsx` o `.csv`
- [ ] **Validación de estructura y contenido** del archivo antes de importar
- [ ] **Reporte de errores de importación** fila por fila
- [ ] **Exportación de listados** a `.xlsx` o `.csv`
- [ ] **Exportación de reportes** en formato PDF
- [ ] **Plantilla descargable** para la carga masiva (con encabezados correctos)

### 4.5 Reportes y Visualización de Datos
- [ ] **Al menos 3 reportes relevantes** al negocio o contexto del sistema
- [ ] **Gráficas o charts** (barras, torta, líneas) con datos reales del sistema
- [ ] **Filtros por fecha, categoría u otros parámetros** en los reportes
- [ ] **Vista de impresión** o exportación directa desde el reporte en PDF

### 4.6 Notificaciones y Comunicación
- [ ] **Notificaciones internas** (dentro del sistema: alertas, mensajes)
- [ ] **Envío de correos electrónicos** automáticos ante eventos clave (registro, cambios, etc.)
- [ ] **Mensajes de confirmación y retroalimentación** ante acciones del usuario

---

## 5. Diseño y Experiencia de Usuario (UI/UX)

- [ ] **Diseño responsivo**: adaptable a móvil, tablet y escritorio
- [ ] **Paleta de colores consistente** y definida en un sistema de diseño o guía de estilos
- [ ] **Tipografía uniforme** en todo el sistema
- [ ] **Iconografía coherente** (un solo conjunto: Material Icons, Font Awesome, etc.)
- [ ] **Flujo de navegación claro**: menú, migas de pan (breadcrumbs), acceso rápido
- [ ] **Accesibilidad básica**: contraste de color, etiquetas ARIA, texto alternativo en imágenes
- [ ] **Estados de carga**: indicadores visuales (spinners, skeletons) mientras se procesan datos
- [ ] **Pantalla de inicio / landing** descriptiva del sistema (si aplica)

---

## 6. Seguridad

- [ ] **Cifrado de contraseñas** (bcrypt, Argon2 u otro algoritmo robusto — nunca MD5 ni SHA1 solos)
- [ ] **Protección contra SQL Injection** (uso de ORM o consultas parametrizadas)
- [ ] **Protección contra XSS** (escapado de salida y sanitización de entradas)
- [ ] **HTTPS** en el despliegue o uso de variables de entorno para datos sensibles
- [ ] **Validación de tipos de archivo** en cargas (no aceptar ejecutables disfrazados)
- [ ] **Límite de intentos de inicio de sesión** (bloqueo temporal ante múltiples fallos)
- [ ] **Variables de entorno** para credenciales y configuraciones sensibles (`.env`)

---

## 7. Calidad del Código

- [ ] **Estructura de carpetas ordenada** y coherente con el patrón o framework usado
- [ ] **Nomenclatura clara y consistente** (variables, funciones, clases, archivos)
- [ ] **Comentarios en código** en secciones complejas o funciones clave
- [ ] **Separación de responsabilidades**: lógica de negocio separada de la presentación
- [ ] **Sin código duplicado**: uso de funciones reutilizables y componentes
- [ ] **Pruebas unitarias o de integración** (al menos sobre los módulos críticos)
- [ ] **Manejo de errores robusto**: try/catch, mensajes amigables al usuario, logs internos
- [ ] **Control de versiones con Git**: historial de commits representativo del trabajo del equipo
- [ ] **Ramas de Git**: uso de al menos `main`, `develop` y ramas por funcionalidad (feature branches)

---

## 8. Despliegue e Infraestructura

- [ ] **Entorno de desarrollo** documentado y replicable (README con instrucciones de instalación)
- [ ] **Archivo de configuración de entorno** (`.env.example` sin datos reales)
- [ ] **Despliegue en servidor o nube** (Railway, Render, Netlify, AWS, VPS, etc.)
- [ ] **URL pública funcional** del sistema en producción
- [ ] **Dominio personalizado** (deseable)
- [ ] **Proceso de CI/CD** básico (deseable: GitHub Actions u otro)

---

## 9. Presentación del Proyecto (Slides)

- [ ] **Portada**: nombre del proyecto, integrantes, programa, fecha
- [ ] **Abstract**: Uno o dos parrafos con un resumen del proyecto en inglés
- [ ] **Problema identificado** y justificación
- [ ] **Objetivos del proyecto**
- [ ] **Tecnologías utilizadas** (stack tecnológico con logos)
- [ ] **Arquitectura del sistema** (diagrama visual)
- [ ] **Modelo de base de datos** simplificado
- [ ] **Resultados y métricas** (número de módulos, usuarios de prueba, datos cargados, etc.)
- [ ] **Dificultades y aprendizajes**
- [ ] **Conclusiones y trabajo futuro**
- [ ] **Slide de preguntas** al final
- [ ] **Diseño visual coherente** con la identidad del proyecto
- [ ] **Duración adecuada**: entre 5 y 8 minutos, luego deben mostrar el proyecto funcionando

---

## 10. Entregables Finales

- [ ] **Repositorio en GitHub/GitLab** con el código fuente completo
- [ ] **README.md completo**: descripción, tecnologías, instrucciones de instalación y uso
- [ ] **Base de datos exportada** (dump o script SQL listo para restaurar)
- [ ] **Manual de usuario PDF** (documento o sección dentro del sistema)
- [ ] **Manual técnico / de instalación PDF**
- [ ] **Presentación en formato `.pptx` o PDF**
- [ ] **Video demo** del sistema funcionando (5 a 10 minutos)

---

## 11. Aspectos Diferenciales (Plus)

- [ ] **Módulo de chat o mensajería interna** entre usuarios
- [ ] **Integración con API externa** (pagos, mapas, clima, WhatsApp, etc.)
- [ ] **Aplicación móvil complementaria** (PWA, Flutter, React Native)
- [ ] **Internacionalización**: soporte para múltiples idiomas
- [ ] **Modo oscuro / claro** switcheable por el usuario
- [ ] **Documentación de API** (Swagger / Postman collection)
- [ ] **Módulo de estadísticas avanzadas** con datos históricos
- [ ] **Inteligencia artificial o machine learning** aplicada al dominio del negocio

---

