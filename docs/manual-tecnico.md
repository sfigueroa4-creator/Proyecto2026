# Manual técnico

## Arquitectura

La estructura aplica arquitectura hexagonal en capas: Express y sus controladores son adaptadores de entrada; los servicios de `application/` implementan casos de uso; `domain/` contiene reglas y validadores sin acceso a infraestructura; `application/ports.js` documenta los contratos de salida. Los adaptadores de `infrastructure/` conectan MongoDB, JWT, bcrypt y almacenamiento privado. `create-services.js` es la raíz de composición que inyecta esos adaptadores antes de montar las rutas.

La arquitectura hexagonal complementa la organización MVC de la interfaz/API: las rutas/controladores traducen HTTP, pero no consultan MongoDB. Los servicios de aplicación dependen de repositorios y servicios abstractos; las implementaciones concretas quedan aisladas. JWT dura ocho horas; los hashes se calculan con bcrypt. Evidencias se almacenan en `uploads/`, no se sirven como archivos estáticos; MongoDB conserva los metadatos.

## Requisitos

- Node.js 20+ y npm.
- MongoDB 7+ accesible por la URI configurada; para desarrollo local puede usarse `docker compose up -d mongodb`.
- Una cuenta inicial configurada con acceso a la base y un secreto JWT aleatorio.

## Configuración e instalación

1. Copia `.env.example` a `.env`; establece `MONGODB_URI`, `MONGODB_DB` y un `JWT_SECRET` aleatorio con al menos 32 caracteres. Para credenciales Mongo separadas de la URI, define juntos `MONGODB_USERNAME` y `MONGODB_PASSWORD`; opcionalmente establece `MONGODB_AUTH_SOURCE`. En ese modo, la URI debe omitir el usuario y la contraseña. Alternativamente puedes usar una URI que ya los contenga, sin las variables separadas. Para la primera carga establece también `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` (12+ caracteres) y, si aplica, `BOOTSTRAP_ADMIN_NAME`.
2. Ejecuta `npm.cmd install`.
3. Con MongoDB disponible ejecuta `npm.cmd run db:check`; el comando prueba la conexión y creación de índices sin mostrar secretos.
4. Si la comprobación termina correctamente, ejecuta `npm.cmd run seed:admin` una sola vez. No compartas la contraseña en el repositorio ni en capturas.
5. Opcionalmente ejecuta `npm.cmd run seed:demo` para datos ficticios.
6. Inicia con `npm.cmd start` o `npm.cmd run dev`. Comprueba `GET /api/health`.
7. Ingresa por `http://localhost:3000`; el cliente no sustituye errores de API con persistencia local.

## Variables de entorno

| Variable | Propósito |
|---|---|
| `PORT` | Puerto HTTP local, por defecto 3000 |
| `MONGODB_URI` | URI local o administrada de MongoDB |
| `MONGODB_DB` | Base lógica, por defecto `gestor_practicas` |
| `MONGODB_USERNAME`, `MONGODB_PASSWORD` | Credenciales opcionales fuera de la URI; deben configurarse juntas |
| `MONGODB_AUTH_SOURCE` | Base de autenticación opcional, por ejemplo `admin` |
| `JWT_SECRET` | Clave de firma, mínimo 32 caracteres aleatorios; no reutilizar la de ejemplo |
| `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` | Datos para crear al primer administrador |
| `TEST_BASE_URL`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` | Configuración opcional de pruebas API |

## Organización de módulos

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Dominio | `src/domain/` | Reglas de validación, roles y errores de negocio sin dependencias externas |
| Aplicación | `src/application/` | Casos de uso de prácticas, usuarios, evidencias y health check; contratos de puertos |
| Adaptadores de entrada | `src/routes/`, `src/controllers/`, `src/middleware/` | HTTP, autenticación de solicitudes, permisos y formatos JSON/CSV |
| Adaptadores de salida | `src/infrastructure/persistence/`, `security/`, `storage/` | MongoDB Driver, bcrypt, JWT y filesystem |
| Raíz de composición | `src/infrastructure/composition/` y `server.js` | Inyección de dependencias y montaje de la aplicación |

Para cambiar MongoDB por otro almacenamiento, se implementa el puerto `RecordsRepository` y se cambia su conexión en `create-services.js`; los casos de uso y rutas no importan el driver.

## Colecciones e índices

La conexión prepara índices únicos para correo/código estudiantil, nombre de institución y correo de usuario; índices de seguimiento para prácticas, horas, visitas, validaciones y evidencias; e índice TTL para tokens revocados. Las colecciones se crean al insertar documentos. `counters` mantiene secuencias atómicas de identificadores enteros, preservando la interfaz JSON anterior.

Colecciones: `students`, `institutions`, `practices`, `hours`, `visits`, `validations`, `evidence`, `users`, `counters`, `revoked_tokens`. El diccionario conceptual completo está en `modelo-relacional.md`.

## Endpoints

| Método/ruta | Permiso |
|---|---|
| `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Autenticación |
| `/api/students`, `/api/institutions`, `/api/practices` | Lectura según perfil; escritura administrador/coordinación |
| `/api/hours` | Estudiante crea; asesor revisa; administrador/coordinación administra |
| `/api/visits` | Asesor, administrador o coordinación |
| `/api/validations` | Institución asociada, administrador o coordinación |
| `/api/evidence` | Archivo privado con autorización por práctica |
| `GET /api/reports`, `/api/reports/practices.csv` | Administrador, coordinación o dirección |
| `/api/users` | Administrador |
| `GET /api/health` | Público; prueba disponibilidad de MongoDB |

Todos los recursos salvo login y health requieren `Authorization: Bearer <token>`. Las cuentas son creadas por administración; asocia `profile_id` al ID del documento student/institution correspondiente y `advisor_user_id` al ID de usuario asesor/a de la asignación.

## Validación y archivos

La capa de modelos valida allowlists de campos, identificadores, estados, fechas, horas e integridad de referencias. MongoDB no proporciona las claves foráneas del esquema SQL anterior; las reglas están en la aplicación. La carga limita tamaño a 10 MB y acepta PDF/JPG/PNG/DOCX/PPTX, con nombre aleatorio, metadatos en MongoDB y descarga autenticada.

## Pruebas y diagnóstico

- `npm.cmd test`: pruebas unitarias y casos API. La integración se omite con aviso si no hay credenciales o si el servidor local no responde; con `TEST_BASE_URL` explícita, la indisponibilidad falla la prueba.
- Para integración: inicia MongoDB y el servidor, crea una cuenta de prueba que no contenga datos reales y ejecuta `TEST_ADMIN_EMAIL=...`/`TEST_ADMIN_PASSWORD=...` en el entorno de pruebas.
- Antes de crear al administrador, `npm.cmd run db:check` verifica conexión e índices sin imprimir URI ni secretos.
- `GET /api/health` debe devolver `status: ok` y `database: MongoDB`.
- Error de conexión: revisa `MONGODB_URI`, DNS/red y permisos del usuario MongoDB.
- `bad auth`/`Authentication failed`: confirma usuario, contraseña, `MONGODB_AUTH_SOURCE` y permisos para la base elegida. No pongas una contraseña con caracteres reservados sin codificarla en la URI; usa las variables separadas para evitarlo.
- `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` durante selección de servidor: TLS falla antes de autenticar. Revisa que el clúster Atlas esté activo y que la IP pública actual esté en **Network Access / IP Access List**; comprueba firewall/VPN o inspección TLS en la red. No relajes la validación TLS del cliente como solución.
- Error de inicio por JWT: configura un `JWT_SECRET` seguro con 32+ caracteres.
- Error al cargar archivo: valida MIME/extensión y el límite de 10 MB; revisa permisos y almacenamiento persistente de `uploads/`.

## Operación segura y límites

No usar `docker-compose.yml` en producción: el servicio local está expuesto solo en loopback y no tiene autenticación. Para despliegue, activa autenticación/TLS en MongoDB, HTTPS en el servicio web, copias de seguridad de la base y de `uploads/`, monitoreo, rotación del secreto, control de retención y revisión de seguridad. Las operaciones de borrado en cascada no son atómicas en un servidor MongoDB standalone; se recomienda replica set/transacciones para producción. La conexión real, integración y despliegue deben probarse en el entorno destino antes de declarar release final.
