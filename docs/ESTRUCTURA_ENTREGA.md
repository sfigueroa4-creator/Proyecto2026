# Estructura de la entrega

La entrega se organiza en los 17 apartados solicitados y enlaza cada uno con su evidencia en el proyecto.

| N.º | Apartado requerido | Evidencia | Estado |
|---:|---|---|---|
| 1 | Introducción | `docs/entrega-tercer-avance.md`, §1 | Incluido |
| 2 | Descripción del problema | `docs/entrega-tercer-avance.md`, §2 | Incluido |
| 3 | Objetivos | `docs/entrega-tercer-avance.md`, §3 | Incluido |
| 4 | Objetivo general | `docs/entrega-tercer-avance.md`, §3.1 | Incluido |
| 5 | Objetivos específicos | `docs/entrega-tercer-avance.md`, §3.2 | Incluido |
| 6 | Justificación | `docs/entrega-tercer-avance.md`, §4 | Incluido |
| 7 | Propuesta del plan del proyecto | `docs/entrega-tercer-avance.md`, §5 | Incluido |
| 8 | Análisis de requerimientos del software | `docs/entrega-tercer-avance.md`, §6 | Incluido |
| 9 | Diseño UML: casos de uso, secuencias, clases, componentes y despliegue | `docs/uml/` (siete fuentes PlantUML) | Incluido |
| 10 | Modelo de datos: entidad-relación, modelo relacional y diccionario de datos | `docs/uml/modelo-er.puml` y `docs/modelo-relacional.md` | Incluido |
| 11 | Prototipo de alta fidelidad | `public/index.html`, `public/css/` y `public/js/` | Incluido en el proyecto |
| 12 | Código documentado y URL pública de GitHub | `README.md`; [repositorio](https://github.com/sfigueroa4-creator/Proyecto2026) | Publicado |
| 13 | Montaje y pruebas CRUD de la base de datos | `npm.cmd run db:check`; `npm.cmd test` | Verificado: conexión MongoDB y 16/16 pruebas aprobadas |
| 14 | Código fuente en versión release | Tag [`v1.0.0`](https://github.com/sfigueroa4-creator/Proyecto2026/tree/v1.0.0) sobre `a47d6f5` | Publicado |
| 15 | Manuales de usuario y técnico | `docs/manual-usuario.md` y `docs/manual-tecnico.md` | Incluidos |
| 16 | Referencias bibliográficas | `docs/entrega-tercer-avance.md`, §16 | Incluidas |
| 17 | Anexos | `docs/entrega-tercer-avance.md`, §17; diagramas y manuales del proyecto | Incluidos |

La suite de integración actual ejecuta los flujos con una cuenta administradora. La aceptación de permisos con cuentas de todos los perfiles y la revisión visual de la interfaz no están cubiertas por esas 16 pruebas.