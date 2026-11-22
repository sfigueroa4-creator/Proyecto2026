# Gestor de Prácticas Académicas

Aplicación web para administrar prácticas académicas, seguimiento de horas, evidencias, visitas, validaciones institucionales e informes. La API Express es un adaptador de entrada; los casos de uso y reglas del dominio se conectan mediante puertos a adaptadores MongoDB, JWT, bcrypt y almacenamiento local privado. La contraseña nunca se guarda en texto plano y la API requiere autenticación para acceder a los datos.

## Requisitos

- Node.js 20 o superior y npm.
- MongoDB local 7+ o un clúster accesible por `MONGODB_URI`.

## Arquitectura

El núcleo aplica arquitectura hexagonal: `src/domain/` mantiene reglas independientes; `src/application/` contiene casos de uso y puertos; `src/infrastructure/` implementa MongoDB, JWT, bcrypt y almacenamiento privado. Las rutas/controladores Express son adaptadores de entrada y `src/infrastructure/composition/create-services.js` inyecta dependencias. Consulta el [manual técnico](docs/manual-tecnico.md) y los diagramas en `docs/uml/`.

## Instalación local

1. Copia `.env.example` a `.env`.
2. Configura `MONGODB_URI` (por defecto `mongodb://127.0.0.1:27017`) y `MONGODB_DB`. Si tu proveedor entrega usuario/contraseña separados de la URI, define juntos `MONGODB_USERNAME` y `MONGODB_PASSWORD`; opcionalmente especifica `MONGODB_AUTH_SOURCE`. También puedes usar una URI que ya contenga credenciales, pero no combines ambos formatos. Usa `MONGODB_URI` segura con TLS en servicios remotos.
3. Configura un correo y una contraseña única (mínimo 12 caracteres) para la primera cuenta administradora con `BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_PASSWORD`.
4. Ejecuta `npm.cmd install`.
5. Si no tienes MongoDB local, ejecuta `docker compose up -d mongodb` (Docker Desktop requerido).
6. Comprueba conexión, credenciales, permisos e índices con `npm.cmd run db:check`; el comando no muestra URI ni contraseña.
7. Crea el administrador una sola vez: `npm.cmd run seed:admin`.
8. Opcionalmente inserta datos ficticios repetibles: `npm.cmd run seed:demo`.
9. Ejecuta `npm.cmd start` y abre `http://localhost:3000`.

En Windows PowerShell se recomienda `npm.cmd` para evitar restricciones locales de ejecución de `npm.ps1`. Nunca publiques `.env`, contraseñas ni datos académicos reales. `MONGODB_PASSWORD` es un valor literal en `.env`; no lo escribas en la línea de comandos ni lo envíes por chat.

## Perfiles

Un administrador crea las cuentas desde **Usuarios** o `POST /api/users`, asignando un rol (`coordinator`, `student`, `advisor`, `institution` o `director`). Las cuentas de estudiante e institución deben asociarse mediante `profile_id` a un perfil existente, y cada perfil solo puede vincularse a una cuenta del mismo rol. Las asignaciones pueden enlazar una cuenta asesora con `advisor_user_id`. El servidor aplica autorización en cada operación y limita las consultas a las prácticas asociadas al perfil.

La sesión usa un token firmado de ocho horas. Para uso institucional de producción se requiere HTTPS, gestión segura de secretos, copias de seguridad, políticas de retención y revisión de seguridad/despliegue.

## Funcionalidades y API

- CRUD de `/api/students`, `/api/institutions`, `/api/practices` y `/api/hours`.
- Seguimiento de `/api/visits` y validación de `/api/validations`.
- Inicio de sesión en `POST /api/auth/login`; sesión actual en `GET /api/auth/me`.
- Evidencias privadas mediante `POST /api/evidence` (PDF, JPG, PNG, DOCX o PPTX; máximo 10 MB), lista por práctica y descarga autorizada.
- Informes agregados en `GET /api/reports` y CSV de prácticas en `/api/reports/practices.csv`.
- Administración de cuentas en `/api/users` (solo administrador).
- `GET /api/health` informa disponibilidad del servidor y MongoDB. Los endpoints API (salvo login y health) requieren token Bearer.
- `GET /api/services?demo=1` demuestra cinco módulos nativos de Node.js y requiere sesión.

Los documentos se guardan en `uploads/`, no en una carpeta pública. Configura almacenamiento persistente y una copia de respaldo en el servidor desplegado.

## Pruebas

`npm.cmd test` ejecuta pruebas unitarias sin servidor. Las pruebas API de integración se ejecutan cuando `TEST_ADMIN_EMAIL` y `TEST_ADMIN_PASSWORD` están configurados, MongoDB está accesible, existe esa cuenta y el servidor está activo. Sin `TEST_BASE_URL`, se omiten con un motivo claro si el servidor local no responde; si se configura `TEST_BASE_URL` y no está disponible, la prueba falla. Un resultado omitido (`SKIP`) no es una prueba de integración exitosa.

## Entregables

- Tercer avance: `docs/entrega-tercer-avance.docx` y fuente Markdown asociada.
- Manuales: `docs/manual-usuario.md` y `docs/manual-tecnico.md`.
- Diagramas UML editables y modelo MongoDB: `docs/uml/` y `docs/modelo-relacional.md`.
- Guía de configuración y pruebas: `docs/GUIA_ENTREGA.md`.

Los registros de demostración usan datos ficticios. El prototipo no está certificado para almacenar información personal o sensible de estudiantes.
