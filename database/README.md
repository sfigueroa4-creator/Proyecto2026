# Persistencia MongoDB

La aplicación crea índices al iniciar y guarda documentos en la base indicada por `MONGODB_DB`. Las colecciones `students`, `institutions`, `practices`, `hours`, `visits`, `validations`, `evidence`, `users`, `counters` y `revoked_tokens` se crean automáticamente al insertar el primer documento.

## Desarrollo local

Desde la raíz del proyecto: `docker compose up -d mongodb`. El volumen `practicas-mongodb` conserva los datos entre reinicios. La instancia del compose se publica solo en loopback y no tiene autenticación; úsala únicamente en desarrollo local.

Configura `MONGODB_URI` y `MONGODB_DB=gestor_practicas` en `.env`. Si la URI no incluye credenciales, configura juntos `MONGODB_USERNAME` y `MONGODB_PASSWORD`; opcionalmente establece `MONGODB_AUTH_SOURCE`. Si la URI ya las incluye, deja vacías las variables separadas. En producción usa una instancia protegida con autenticación, TLS, acceso de red limitado y copias de seguridad.

Ejecuta `npm.cmd run db:check` para comprobar conectividad y crear/verificar índices. El comando no inserta datos ni imprime la URI o las credenciales.

`npm run seed:demo` inserta registros ficticios identificados para demostración sin sobrescribirlos. `npm run seed:admin` crea el primer administrador usando las variables de bootstrap; se detiene si el correo ya existe.

## Modelo

Los documentos usan identificadores enteros por compatibilidad con el prototipo. La colección `counters` los asigna de forma atómica; las relaciones se guardan como `student_id`, `institution_id` y `practice_id`, y se validan en los casos de uso de aplicación a través del puerto de repositorio. Los índices únicos y de consulta se preparan en `src/config/database.js`, que forma parte de la infraestructura.

MongoDB no aplica las claves foráneas SQL del diseño anterior. Las reglas de referencia y el borrado dependiente se implementan en `src/application/records.service.js`, sobre el contrato `RecordsRepository`; antes de una puesta en producción deben añadirse transacciones en un replica set, validación de esquemas del lado de la base y pruebas de recuperación.
