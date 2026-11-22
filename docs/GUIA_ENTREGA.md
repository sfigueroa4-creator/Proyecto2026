# Guía de instalación y verificación

## Preparar el entorno

1. Instala Node.js 20+ y Docker Desktop, o prepara un clúster MongoDB accesible.
2. Desde la raíz de `Proyecto2026`: `docker compose up -d mongodb`. El compose local no configura autenticación y solo escucha en loopback; úsalo únicamente en desarrollo.
3. Copia `.env.example` a `.env`; configura URI y base Mongo. Si recibiste usuario/contraseña separados, completa `MONGODB_USERNAME` y `MONGODB_PASSWORD` juntos; opcionalmente `MONGODB_AUTH_SOURCE`. Si la URI ya incluye credenciales, deja vacías las variables separadas. Cambia también el secreto JWT y contraseña de bootstrap por valores privados.
4. Ejecuta `npm.cmd install` y `npm.cmd run db:check`. El segundo comando prueba conexión/índices sin imprimir secretos.
5. Si la comprobación pasó, ejecuta `npm.cmd run seed:admin` y opcionalmente `npm.cmd run seed:demo`.
6. Inicia el servidor con `npm.cmd start`. Abre `http://localhost:3000` y verifica `http://localhost:3000/api/health`.
7. Ingresa con `BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_PASSWORD`. Crea perfiles y cuentas; anota los IDs para vincular estudiantes, instituciones y asesores.

No pegues la URI ni credenciales en el chat, terminal, capturas o repositorio; mantenlas solo en `.env`, que está excluido de Git.

Si `db:check` informa `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`, la negociación TLS falla antes de autenticar: revisa estado del clúster Atlas, **Network Access / IP Access List** para tu IP pública actual y posibles restricciones de firewall/VPN o inspección TLS. No desactives la validación TLS.

## Verificar funciones

- Como administrador, crea/edita/elimina estudiante, institución, práctica y hora. Comprueba que una institución con prácticas no se pueda borrar.
- Crea cuentas ficticias para estudiante, asesor, institución y dirección con perfiles de demostración; comprueba que la API bloquee acciones no autorizadas.
- El estudiante registra horas en estado pendiente y sube archivo PDF/JPG/PNG/DOCX/PPTX menor o igual a 10 MB.
- El asesor revisa horas y registra visitas; la institución valida asistencia/desempeño.
- Coordinación/dirección consulta el resumen y descarga `informe-practicas.csv`.
- Prueba errores: token ausente/expirado, estado desconocido, relación inexistente, fecha inválida, archivo >10 MB y MIME no permitido.
- Ejecuta `npm.cmd test`. Las pruebas de integración se omiten con una razón clara si no hay credenciales o el servidor local no responde; omitir no es aprobar. Para integración, prepara `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`, MongoDB y servidor activo.

## Evidencias y empaque

Guarda capturas reales de login/perfiles, registros, visita, validación, carga/descarga de evidencia, informe y resultados de pruebas. Usa exclusivamente datos ficticios. El directorio `uploads/` se excluye del repositorio salvo `.gitkeep`.

Antes de publicar:

- Revisa los cambios del repositorio y confirma que `.env`, contraseñas y archivos privados no estén incluidos.
- Verifica que la URL pública permita acceso sin iniciar sesión y que no contenga datos personales.
- Renderiza diagramas de `docs/uml/` con PlantUML y revisa legibilidad.
- Completa autores, institución, enlaces, evidencias, artículo IEEE de 5–8 páginas y video de máximo 5 minutos.
- Prueba inicio con base vacía, las semillas, CRUD y recuperación en un entorno limpio.

La conexión a MongoDB, pruebas de integración, publicación, artículo y video requieren ejecución real por el equipo; no deben marcarse como verificados por el solo hecho de existir en el código.
