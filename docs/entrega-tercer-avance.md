# Sistema Integral de Gestión de Prácticas Académicas
## Tercer avance · Aplicación funcional y plan de cierre

**Programa:** Ingeniería de Sistemas  
**Semestre:** Quinto  
**Periodo:** 2026–2  
**Cursos vinculados:** Ingeniería del Software II, Programación III y Teoría General de Sistemas  
**Equipo:** Sergio Miguel Figueroa Delgado (código pendiente) y Gabriel Eduardo Mogollon Pedraza (código pendiente)\
**Institución:** UDI\
**Fecha de actualización:** 22 de noviembre de 2026, 3:02 p. m. (-05:00)\
**Fecha límite indicada en la propuesta:** domingo 22 de noviembre de 2026, 11:30 p. m.

> **Estado del documento:** la conexión a MongoDB Atlas y la suite de integración se verificaron localmente: 16 pruebas aprobadas, 0 fallidas y 0 omitidas. La suite cubre los flujos API con cuenta administradora; siguen pendientes la aceptación con todos los perfiles, las evidencias de interfaz, el artículo IEEE y el video. El commit `a47d6f5` ya está publicado en la rama pública `main`.

## 1. Introducción

Las prácticas académicas son un componente central de la formación docente: permiten llevar los conceptos pedagógicos al aula y requieren coordinación entre estudiantes, asesores, instituciones receptoras y directivos de programa. Su gestión implica asignar escenarios, verificar convenios, realizar seguimiento y consolidar evidencias y horas para procesos de calidad.

Este proyecto propone un sistema web centralizado para apoyar esos procesos. El segundo avance dejó una línea base de prototipo de alta fidelidad, servidor Node.js con Express organizado según MVC y CRUD sobre entidades básicas. En el tercer avance se migró la persistencia a MongoDB y se incorporaron en el código cuentas por rol, registros de visitas, validaciones institucionales, informes y carga privada de evidencias. La conexión Atlas, índices y los flujos API principales de integración se probaron; quedan pendientes aceptación completa por perfil y evidencias de uso de la interfaz.

## 2. Descripción del problema

La propuesta integradora identifica que la información de prácticas suele estar distribuida en hojas de cálculo, correo y archivos individuales. Esta fragmentación dificulta mantener datos actualizados, asignar instituciones oportunamente, dar trazabilidad a evaluaciones, verificar horas y construir informes; también incrementa el trabajo operativo y el riesgo de extravío de evidencias.

El sistema centraliza estudiantes, instituciones, asignaciones, actividades, visitas y validaciones. La API incorpora autorización por roles y persistencia MongoDB. Los informes son operativos y no sustituyen auditorías institucionales; la infraestructura de producción, copias de seguridad y aceptación formal del programa aún deben definirse.

## 3. Objetivos

### 3.1 Objetivo general

Diseñar, construir y validar un sistema web para centralizar y facilitar el seguimiento de las prácticas académicas de un programa de licenciatura.

### 3.2 Objetivos específicos

1. Completar y validar los requisitos funcionales y atributos de calidad con sus casos de uso.
2. Actualizar los modelos UML y de datos para reflejar la solución final.
3. Completar los flujos funcionales de los actores y protegerlos según sus permisos.
4. Implementar y probar la API, la persistencia y los informes requeridos.
5. Validar CRUD, reglas de negocio, seguridad y persistencia con MongoDB.
6. Preparar versión release, manuales, artículo IEEE, evidencias y video de sustentación.
7. Conservar la demostración de los cinco módulos nativos de Node.js como evidencia de Programación III.

## 4. Justificación

Un sistema centralizado hace más visible el estado de las asignaciones y permite vincular a cada estudiante con una institución y una bitácora de horas. El registro estructurado mejora la trazabilidad y establece una base consultable para decisiones académicas. Para el ejercicio integrador, el alcance vertical —interfaz, API, persistencia y diagramas— vincula los conocimientos de modelado y diseño de Ingeniería del Software II con HTML/CSS/JavaScript, Node.js y Express de Programación III.

## 5. Plan del proyecto y arquitectura

### 5.1 Iteración del segundo avance

| Etapa | Actividades | Evidencia |
|---|---|---|
| Refinamiento | Identificar actores, alcance de la iteración y casos prioritarios | Requisitos y casos de uso |
| Diseño | Definir dominio, arquitectura hexagonal/MVC, secuencias y modelo de datos | Fuentes PlantUML y colecciones MongoDB |
| Construcción | Desarrollar interfaz web, API REST y persistencia MongoDB | Aplicación funcional |
| Verificación | Ejecutar operaciones CRUD y revisar integridad referencial | Pruebas y registros verificables |
| Entrega | Documentar decisiones y publicar el repositorio | URL pública y documento final |

### 5.2 Arquitectura

Se adopta una arquitectura cliente-servidor. La interfaz mantiene una separación MVC:

- **Vista:** HTML5, CSS3 y JavaScript modular en `public/`; panel y formularios de gestión.
- **Controlador/adaptador HTTP:** rutas Express que reciben solicitudes y serializan respuestas JSON/CSV.
- **Dominio y aplicación:** validación allowlist, referencias, permisos y casos de uso independientes del framework.
- **Adaptadores de salida:** MongoDB Driver, bcrypt/JWT y almacenamiento privado de evidencias.
- **Composición:** el servidor conecta puertos con adaptadores concretos al iniciar.

La solución conserva MVC para presentación y manejo HTTP, y separa el núcleo mediante arquitectura hexagonal. Rutas/controladores Express son adaptadores de entrada; `src/application/` contiene casos de uso; `src/domain/` mantiene validaciones y roles sin paquetes externos; `src/application/ports.js` documenta contratos de salida. Los adaptadores MongoDB, bcrypt/JWT y filesystem viven en `src/infrastructure/`. `create-services.js` actúa como raíz de composición e inyecta implementaciones concretas al servidor. Los casos de uso no importan Express, MongoDB ni filesystem.

Esta estructura sí implementa inversión de dependencias en la aplicación, pero no implica que MongoDB pueda cambiarse sin escribir otro adaptador ni que las pruebas de integración estén ejecutadas. El diagrama de clases muestra los puertos y adaptadores.

### 5.3 Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5, CSS3, JavaScript ES modules | Interfaz web adaptable e interacción CRUD |
| Node.js 20 o superior | Entorno de ejecución del servidor |
| Express 4 | Servidor HTTP, rutas REST y archivos estáticos |
| MongoDB 7+ y driver oficial | Persistencia documental e índices |
| bcryptjs, jsonwebtoken, express-rate-limit | Hashes de contraseña, autenticación JWT y limitación de intentos |
| multer | Carga limitada de evidencias a almacenamiento privado |
| dotenv | Configuración local por variables de entorno |
| PlantUML | Diagramas editables de análisis y diseño |

### 5.4 Ejecución local

1. Instalar Node.js 20 o superior y MongoDB 7+, o iniciar la instancia local con `docker compose up -d mongodb`.
2. Copiar `.env.example` a `.env`; configurar `MONGODB_URI`/`MONGODB_DB` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. Si las credenciales se entregan por separado, completar juntos `MONGODB_USERNAME` y `MONGODB_PASSWORD`, opcionalmente `MONGODB_AUTH_SOURCE`; no combinar ambos formatos. No publicar `.env`.
3. Instalar dependencias con `npm.cmd install` y probar conexión/índices con `npm.cmd run db:check` sin mostrar secretos.
4. Configurar `BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_PASSWORD` (12+ caracteres) y ejecutar una sola vez `npm.cmd run seed:admin`.
5. Opcionalmente cargar datos ficticios con `npm.cmd run seed:demo`; iniciar con `npm.cmd start` y abrir `http://localhost:3000`.

## 6. Análisis de requerimientos

### 6.1 Actores

- **Coordinador/a de práctica:** gestiona estudiantes, convenios, asignaciones y revisiones.
- **Estudiante:** registra horas y actividades y consulta el avance.
- **Docente asesor/a:** acompaña y revisa registros de práctica.
- **Institución receptora:** participa en validaciones de asistencia y desempeño.
- **Director/a del programa:** consulta indicadores e informes de calidad.

### 6.2 Requerimientos funcionales priorizados

| ID | Requerimiento | Prioridad | Estado en prototipo |
|---|---|---|---|
| RF-01 | Crear, consultar, editar y eliminar estudiantes | Alta | CRUD API con validación/autorización probado contra Atlas; falta aceptación completa de interfaz |
| RF-02 | Administrar instituciones y estado de convenio | Alta | CRUD API y restricción de borrado probados contra Atlas; falta aceptación completa de interfaz |
| RF-03 | Asignar estudiante, institución y asesor a una práctica | Alta | Creación y validación de referencias probadas contra Atlas; asociar `advisor_user_id` al crear la práctica |
| RF-04 | Registrar, consultar, editar y eliminar horas y actividades | Alta | CRUD API, revisión y limpieza de evidencias probados contra Atlas; falta aceptación completa por perfil |
| RF-05 | Consultar indicadores básicos del periodo y asignaciones | Alta | Panel de aplicación; meta de 160 h es ilustrativa, requiere confirmación |
| RF-06 | Exportar registros visibles a CSV | Media | Exportación de interfaz y CSV de informes; prueba de regresión pendiente |
| RF-07 | Adjuntar planes de clase y evidencias a la plataforma | Media | Carga/descarga privada por API probadas con PDF; aceptación de otros tipos y tamaños pendiente |
| RF-08 | Registrar visitas y evaluación pedagógica del asesor | Media | Creación de visitas probada contra Atlas; aceptación de interfaz pendiente |
| RF-09 | Validar asistencia y desempeño desde la institución receptora | Media | Creación de validaciones probada contra Atlas; falta probar el alcance con cuenta de institución |
| RF-10 | Generar informes detallados para autoevaluación y acreditación | Media | Informe JSON/CSV de seguimiento; validar fórmulas/formato con el programa |
| RF-11 | Autenticar usuarios y proteger funciones según su rol | Alta | Login/logout JWT, bcrypt, rate limit y guardas por rol/perfil |

El diagrama inicial de segundo avance representaba once casos de uso; su estimación de cobertura de 7/11 (63,6 %) es una línea base, no una prueba. La actualización del tercer avance agrega los casos transversales de sesión y administración de cuentas, para un total de trece flujos en `docs/uml/casos-de-uso.puml`. Las funciones están incorporadas en código, pero no se deben declarar 100 % verificadas hasta ejecutar aceptación con MongoDB, cuentas de cada rol y registros de prueba.

### 6.3 Requerimientos no funcionales

- **Usabilidad:** interfaz en español con navegación consistente, formularios etiquetados y retroalimentación de operaciones.
- **Adaptabilidad:** presentación funcional en escritorio y pantallas móviles.
- **Mantenibilidad:** separación de dominio, casos de uso, puertos y adaptadores, con MVC en la interfaz HTTP.
- **Integridad:** índices únicos y validaciones de campos, fechas, horas y referencias en los modelos; MongoDB no impone claves foráneas SQL.
- **Seguridad:** hash bcrypt, JWT de duración limitada, revocación, protección por rol/perfil y archivos privados; HTTPS, auditoría, respaldo y hardening de producción pendientes.

### 6.4 Supuestos y restricciones

- El periodo de referencia es 2026–2 y la meta ilustrativa es 160 horas por estudiante; el programa debe confirmar el requisito oficial.
- Los nombres, instituciones y cantidades incluidos son datos de demostración y deben sustituirse antes de cualquier uso real.
- Se puede registrar una URL externa y cargar un archivo permitido; la disponibilidad/privacidad de URL externa no se garantiza.
- El cliente requiere API y token; no simula éxito ni guarda cambios localmente cuando no hay servidor.
- Las referencias documentales usan IDs numéricos controlados por `counters`; las reglas de integridad y borrado en cascada se ejecutan en la aplicación.

## 7. Diseño UML

Las fuentes `.puml` entregadas son editables y se pueden renderizar con PlantUML:

1. `docs/uml/casos-de-uso.puml`: seis perfiles y trece casos de uso finales.
2. `docs/uml/diagrama-de-clases.puml`: dominio, casos de uso, puertos, adaptadores y composición.
3. `docs/uml/secuencia-asignar-practica.puml`: flujo REST de asignación y lectura posterior.
4. `docs/uml/secuencia-registro-horas.puml`: registro del estudiante y revisión del asesor.
5. `docs/uml/modelo-er.puml`: relaciones lógicas entre documentos.
6. `docs/uml/diagrama-componentes.puml` y `docs/uml/diagrama-despliegue.puml`: arquitectura y nodos de despliegue.
7. `docs/modelo-relacional.md`: colecciones, reglas e índices MongoDB.

## 8. Modelo de datos

La base lógica `gestor_practicas` usa colecciones `students`, `institutions`, `practices`, `hours`, `visits`, `validations`, `evidence`, `users`, `counters` y `revoked_tokens`. Las relaciones se guardan por identificadores, verificadas en la capa de modelo. Los índices únicos cubren código/correo estudiantil, nombre institucional y correo de cuenta. El borrado dependiente y de archivos se resuelve en la aplicación; al usar una instancia standalone no hay transacción multidocumento y la producción requiere replica set, validación de esquemas y pruebas de recuperación.

El diagrama conceptual y diccionario de colecciones se suministran en `docs/uml/modelo-er.puml` y `docs/modelo-relacional.md`; MongoDB no tiene claves foráneas SQL.

## 9. Prototipo de alta fidelidad y funcionalidad

La interfaz contiene panel, gestión de recursos, sesiones, usuarios, visitas, validaciones, evidencias privadas e informes. Express verifica roles/perfiles y persiste registros en MongoDB. El acceso real exige una cuenta creada por administración; si API o MongoDB no están disponibles, la aplicación comunica el error y no simula persistencia local.

## 10. Montaje y pruebas CRUD

### 10.1 Endpoints

| Recurso | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| `/api/students` | Listar | Crear | Actualizar por ID | Eliminar por ID |
| `/api/institutions` | Listar | Crear | Actualizar por ID | Eliminar por ID |
| `/api/practices` | Listar con nombres y horas | Crear | Actualizar por ID | Eliminar por ID |
| `/api/hours` | Listar con estudiante/evidencia | Crear | Revisar/actualizar | Eliminar por ID |
| `/api/visits` | Listar por perfil | Crear visita | Actualizar | Eliminar por ID |
| `/api/validations` | Listar por perfil | Crear validación | Actualizar | Eliminar por ID |
| `/api/evidence` | Listar por práctica | Subir archivo privado | — | Se elimina con práctica |
| `/api/auth/login` | — | Autenticar y emitir JWT | — | — |
| `/api/auth/me`, `/api/auth/logout` | Consultar sesión | Revocar sesión | — | — |
| `/api/users` | Administrador | Crear cuenta/rol | — | — |
| `/api/reports` | Informe JSON/CSV | — | — | — |
| `/api/practices/summary` | Indicadores agregados | — | — | — |
| `/api/services` | Demo cinco módulos Node | — | — | — |
| `/api/health` | Estado y plataforma del servidor | — | — | — |

### 10.2 Casos de prueba propuestos

| ID | Prueba | Resultado esperado |
|---|---|---|
| T-01 | Consultar la lista de estudiantes | HTTP 200 y colección JSON |
| T-02 | Crear estudiante con campos obligatorios | HTTP 201; registro visible en la lista |
| T-03 | Editar correo y estado de estudiante existente | HTTP 200; datos modificados en MongoDB |
| T-04 | Eliminar el estudiante de prueba sin dependencias | HTTP 204; registro ausente al consultar |
| T-05 | Crear práctica con estudiante e institución existentes | HTTP 201; referencias MongoDB válidas |
| T-06 | Crear práctica con institución inexistente | HTTP 400 controlado; no se inserta registro |
| T-07 | Registrar horas, adjuntar evidencia y revisar estado | Archivo privado descargable; registro cambia a aprobado solo por asesor/coordinación |
| T-08 | Registrar visita y validación de asistencia/desempeño | Quedan asociados a la práctica y limitados al perfil |
| T-09 | Consultar informe JSON y exportar CSV | Totales y asignaciones consistentes con los datos de prueba |
| T-10 | Consultar `/api/services?demo=1` con JWT | JSON con UUID, plataforma, archivo, ruta y parámetros |
| T-11 | Intentar leer recursos sin JWT o modificar con rol incorrecto | HTTP 401/403; no hay cambio persistido |

Las pruebas T-01 a T-11 describen criterios esperados; la suite ejecutada cubre una parte. El 22 de noviembre de 2026, `npm.cmd run db:check` confirmó conexión con Atlas, ping y creación/verificación de índices. En esta máquina fue necesario iniciar Node con `NODE_OPTIONS=--use-system-ca` para confiar en el certificado de Windows; la verificación TLS permaneció activa. Con el servidor activo y una cuenta administradora aprovisionada, `npm.cmd test` pasó 16 pruebas: 16 aprobadas, 0 fallidas y 0 omitidas. La integración verificó CRUD de datos ficticios, carga y descarga privada de PDF, visitas, validaciones, informes/CSV, rechazo de acceso anónimo, revocación del token y eliminación de evidencia al borrar horas. No cubrió todos los roles ni la aceptación visual completa.

Las pruebas de dominio están en `tests/models.test.js`; `tests/architecture.test.js` ejecuta casos de uso con repositorios falsos, sin MongoDB. El conjunto `tests/api.test.js` cubre login de administrador, CRUD, visitas, validaciones, informes, carga/descarga privada y revocación del token. El 22 de noviembre de 2026, `npm.cmd test` pasó 16/16 pruebas con ninguna omitida. En este equipo Node necesitó `NODE_OPTIONS=--use-system-ca` para confiar en el certificado instalado en Windows; la verificación TLS permaneció activa.

## 11. Programación III: cinco módulos nativos de Node.js

El endpoint de demostración `/api/services` utiliza módulos incorporados en Node.js, sin paquetes npm adicionales:

| Módulo | Uso práctico en este prototipo | Resultado verificable |
|---|---|---|
| `node:fs/promises` | Listar archivos del directorio público de la aplicación | Conteo de archivos estáticos |
| `node:path` | Normalizar una ruta y extraer el nombre de un archivo | `firstPublicFile` |
| `node:os` | Consultar la plataforma del servidor | `platform` (por ejemplo, `win32`) |
| `node:crypto` | Generar un identificador de ejecución no predecible | `uuid` diferente por solicitud |
| `node:url` | Analizar la URL y leer parámetros de búsqueda | `requestedPath` y `queryParameters` |

**Ejemplo de entrada:** `GET /api/services?demo=1`  
**Ejemplo de salida:** objeto JSON con los cinco resultados observables en la interfaz. El módulo `node:crypto` identifica cada ejecución de demostración; las contraseñas se hashean con bcrypt y la API usa JWT para autenticar.

## 12. Código y repositorio público

**URL del repositorio GitHub:** https://github.com/sfigueroa4-creator/Proyecto2026 (público)\
**Rama pública:** `main`, commit `a47d6f5`. **Versión release publicada:** [`v1.0.0`](https://github.com/sfigueroa4-creator/Proyecto2026/tree/v1.0.0), tag sobre el commit `a47d6f5`. El tag heredado `Demo` apunta a la versión anterior.\
**Instrucciones de instalación:** `README.md` en la raíz del proyecto.

No incluir credenciales reales, archivo `.env`, datos personales ni evidencias privadas en el repositorio público. Mantener `.env.example` con nombres de variables y valores ficticios.

## 13. Tercer avance: implementación y cierre

La propuesta identifica el tercer avance como entrega final de la aplicación funcional y asigna una ponderación de 10 % a Ingeniería del Software II, 10 % a Teoría General de Sistemas y 25 % a Programación III. El código de esta versión migra a MongoDB y añade los flujos faltantes de usuario, evidencia, visita, validación e informes. La puesta en marcha con una instancia real, aceptación funcional y artefactos finales aún son responsabilidad del equipo.

### 13.1 Elementos incorporados al código

- **Persistencia MongoDB:** driver oficial, URI configurable, colecciones/índices, contadores numéricos, índices únicos y seed ficticio opcional. Se retiró `mysql2` y el esquema SQL.
- **Autenticación:** cuenta administradora inicial mediante script, cuentas con seis roles, bcrypt, JWT de ocho horas, revocación en logout e intentos de login limitados.
- **Autorización:** middleware de rol y comprobación de perfil/práctica en la API; el cliente oculta acciones no autorizadas como apoyo de interfaz, no como control de seguridad.
- **Evidencias:** carga y descarga con token, almacenamiento fuera de `public/`, nombre interno aleatorio, validación de tipo/extensión y límite de 10 MB.
- **Seguimiento adicional:** CRUD de visitas pedagógicas y validaciones de asistencia/desempeño, vinculadas a una práctica.
- **Informes:** totales de prácticas, horas reportadas/aprobadas, visitas y validaciones pendientes, más CSV de asignaciones.
- **Arquitectura hexagonal:** casos de uso desacoplados con puertos/repositorios inyectados; adaptadores concretos separados para MongoDB, JWT, bcrypt y almacenamiento privado.
- **Documentación técnica:** manuales, guía, diccionario MongoDB y diagramas de casos de uso, clases, secuencias, ER conceptual, componentes y despliegue.

Estos elementos existen en el código y se verificaron localmente con MongoDB Atlas para los flujos cubiertos por las 16 pruebas. Esto no certifica el sistema para producción ni reemplaza la aceptación con cuentas de cada rol; siguen pendientes el endurecimiento operativo, los respaldos probados y la revisión institucional.

### 13.2 Paquetes de trabajo y criterios de salida

| Orden | Paquete y esfuerzo estimado | Dependencia | Criterio de salida |
|---|---|---|---|
| 1 | Configurar MongoDB y secretos (15–30 min) | Acceso a Docker o MongoDB administrado | `/api/health` informa `status: ok` y `database: MongoDB`; secreto/credenciales privados |
| 2 | Crear administrador, datos de prueba y cuentas por rol (15–30 min) | Paquete 1 | Login funciona; IDs de perfiles asociados; datos solo ficticios |
| 3 | Ejecutar pruebas unitarias/API y corregir defectos (30–60 min+) | Paquete 2 | `npm.cmd test` sin fallos; integración no omitida; aceptación de flujos principales por rol |
| 4 | Probar archivos e informes (20–40 min+) | Paquetes 2–3 | PDF permitido se carga/descarga con rol autorizado; reporte y CSV coherentes |
| 5 | Completar evidencias y paquete académico (tiempo según equipo) | Paquetes 3–4 | Autores, URL pública, capturas, artículo IEEE, video y release verificados |

La estimación preliminar de 13–21 días-persona correspondía al desarrollo completo desde la línea base. La conexión a MongoDB y las pruebas de integración ya se ejecutaron; la aceptación por todos los perfiles, las evidencias visuales y los artefactos académicos finales todavía requieren trabajo del equipo.

### 13.3 Secuencia y calendario de referencia

| Fecha límite | Hito | Evidencia para aceptar el hito |
|---|---|---|
| 22 de noviembre, inmediatamente | Iniciar MongoDB, completar `.env` sin compartir secretos, sembrar el administrador y comprobar health | API conectada y acceso administrador demostrado |
| 22 de noviembre, a continuación | Ejecutar pruebas unitarias e integración; arreglar fallos críticos; probar una cuenta por rol y archivo | Salidas reales de pruebas y capturas sin datos reales |
| 22 de noviembre, antes de las 11:00 p. m. si es posible | Completar códigos, artículo IEEE, video, publicar la versión y revisar el repositorio | Paquete revisado por el equipo |
| 22 de noviembre, 11:30 p. m. | Límite de entrega informado en la propuesta | Entrega cargada en el medio oficial |

La actualización original de este documento fue a las 12:29 (-05:00) del mismo día de entrega. La fecha límite indicada en la propuesta es el 22 de noviembre a las 11:30 p. m.; la sustentación es el 25 de noviembre para 5A y el 24 de noviembre para 5L/5LA. Confirmar grupo y horario oficial.

### 13.4 Definición de terminado

La entrega se considera lista únicamente cuando:

- Los trece casos de uso finales están trazados a requisitos, actor, prueba y evidencia, y pasan de extremo a extremo con MongoDB.
- RF-01 a RF-11 tienen estado respaldado por el producto; los flujos y permisos están probados con cuentas reales de cada rol.
- Los diagramas requeridos incluyen casos de uso, secuencias, clases, componentes, despliegue y modelo ER conceptual; el diccionario concuerda con colecciones e índices.
- CRUD de tablas básicas, restricciones, validaciones y resultados de informes están probados con datos ficticios.
- Se entregan manual de usuario, manual técnico, código fuente de versión release, artículo en plantilla IEEE de 5–8 páginas y video de demostración de máximo cinco minutos.
- El repositorio GitHub es público y reproducible; no contiene `.env`, contraseñas ni datos reales. La etiqueta/release y el documento apuntan a la misma versión.
- El video demuestra la aplicación conectada a la base de datos, los flujos completos y los informes; las capturas y salidas conservan resultados auténticos.

### 13.5 Riesgos y decisiones por cerrar

| Riesgo o decisión | Acción de cierre |
|---|---|
| Aceptación por todos los perfiles, capturas y artefactos finales pendientes | Completar pruebas de roles/interfaz y adjuntar evidencia observada |
| URI, usuario/clave MongoDB y `JWT_SECRET` dependen del entorno del equipo | Configurar localmente y excluir `.env`/secretos de Git |
| MongoDB standalone no soporta las garantías transaccionales del borrado multidocumento | Usar replica set en producción; validar copias y restauración |
| Meta de horas y reglas institucionales no confirmadas | Validar con el programa y marcar la meta ilustrativa como tal |
| Versión publicada sin etiqueta de release | Crear la etiqueta después de validar los artefactos finales y actualizar el documento publicado |

### 13.6 Lista de entrega final

- [ ] Confirmar los códigos estudiantiles del equipo; los nombres, la institución y la URL pública ya están consignados.
- [x] Incorporar diagramas de componentes y despliegue y actualizar UML/datos para MongoDB.
- [x] Adjuntar manual de usuario y manual técnico; completar procedimiento de respaldo/restauración con el entorno destino.
- [ ] Terminar el artículo IEEE en el rango de 5 a 8 páginas y verificar plantilla, referencias y figuras.
- [ ] Grabar y revisar un video de hasta cinco minutos que muestre todos los casos de uso y los informes contra la base de datos.
- [ ] Completar pruebas de aceptación de todos los perfiles y de la interfaz en una instalación limpia; guardar capturas y salidas con datos ficticios.
- [ ] Crear y verificar la versión release; comprobar que `README.md`, el documento y el repositorio describen la misma versión.
- [ ] Revisar ortografía, referencias, enlaces, anexos y consistencia final del documento.

## 14. Arquitectura hexagonal aplicada

La refactorización desacopla los casos de uso de la infraestructura mediante `RecordsRepository`, `UsersRepository`, `EvidenceStorage`, `PasswordHasher`, `TokenService` y `DatabaseHealthPort`. El servidor crea los adaptadores MongoDB, almacenamiento local, bcrypt y JWT en la raíz de composición e inyecta los servicios en routers/controladores Express. `npm.cmd run db:check` confirmó conexión Atlas, ping y creación/verificación de índices. Con administrador de bootstrap y servidor activo, `npm.cmd test` pasó 16/16 pruebas, incluidas las pruebas API de CRUD, evidencias, visitas, validaciones, informes y sesión. La aceptación completa por rol y de la interfaz aún requiere ejecución y evidencias.

La conexión a MongoDB Atlas y los flujos API de CRUD, autorización anónima, archivos, visitas, validaciones e informes están verificados contra la base. Falta ejecutar la aceptación con cuentas de cada perfil y documentar la interfaz en una instalación limpia. La sustitución de MongoDB sigue requiriendo implementar y probar un adaptador conforme al puerto; las rutas, servicios de aplicación y validaciones de dominio no deben modificarse para ello. La demostración de módulos nativos en `/api/services` es un endpoint didáctico puntual, separado del núcleo de negocio.

## 15. Conclusiones y estado de preparación

El código de este avance incorpora persistencia MongoDB configurable, conexión Atlas verificada con ping/índices, CRUD API probado, autenticación/roles, archivos privados, visitas, validaciones e informes y se acompaña de guía, manuales y diagramas. La suite actual pasó 16/16 pruebas, pero no cubre todos los perfiles ni la aceptación de la interfaz. El código está publicado en GitHub como `v1.0.0`. La aceptación de todos los perfiles y la evidencia visual no están cubiertas por las pruebas actuales. Por ello, no se declara cumplido el 100 % de los casos ni lista para uso institucional.

## 16. Referencias

- Propuesta de Proyecto Integrador, “Software para la Gestión de Prácticas Académicas”, Ingeniería de Sistemas, periodo 2026–2, quinto semestre.
- Material del curso Ingeniería del Software II, periodo 2026–II. Conceptos de arquitectura MVC, diseño UML, atributos de calidad y arquitectura hexagonal.
- Retroalimentación C2 de Programación III Diurna, 2026–2. Material didáctico sobre JavaScript, Node.js, módulos nativos, npm y Express.
- Node.js. *Documentation*. https://nodejs.org/docs/latest/api/
- Express. *Express 4.x API Reference*. https://expressjs.com/en/4x/api.html
- MongoDB. *Node.js Driver*. https://www.mongodb.com/docs/drivers/node/current/
- MongoDB. *Manual*. https://www.mongodb.com/docs/manual/
- bcrypt.js. https://github.com/dcodeIO/bcrypt.js
- jsonwebtoken. https://github.com/auth0/node-jsonwebtoken

## 17. Anexos

- Código fuente de interfaz y servidor.
- Configuración MongoDB (`docker-compose.yml`, `.env.example`) y scripts de cuenta/demostración.
- Diagramas editables PlantUML y modelo relacional.
- Evidencias de pruebas y capturas de pantalla: adjuntar después de ejecutar y validar localmente.
- Manual de usuario y manual técnico: `docs/manual-usuario.md` y `docs/manual-tecnico.md`.
- Artículo IEEE de 5–8 páginas y video final de máximo cinco minutos: pendientes de producción por el equipo.
