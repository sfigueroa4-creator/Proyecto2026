# Modelo de datos MongoDB

El diseño lógico conserva relaciones conceptuales entre las entidades, pero la persistencia del tercer avance usa documentos en MongoDB, no tablas ni claves foráneas SQL. La capa de modelos valida referencias e implementa borrado dependiente; para operación distribuida con garantías atómicas se requiere MongoDB en replica set y transacciones.

Todos los recursos funcionales usan `_id` entero asignado atómicamente por `counters`, marcas `created_at`/`updated_at` y referencias numéricas explícitas. Las cuentas guardan un hash bcrypt, nunca la contraseña.

## Colecciones y campos

| Colección | Campos principales | Reglas e índices |
|---|---|---|
| `students` | `_id`, `code`, `full_name`, `email`, `semester`, `status`, `user_id` | `code` y `email` únicos; rol student se vincula mediante `profile_id` o `user_id` |
| `institutions` | `_id`, `name`, `city`, `contact_name`, `contact_email`, `agreement_status`, `user_id` | nombre único; asociación de cuenta institucional |
| `practices` | `_id`, `student_id`, `institution_id`, `advisor_name`, `advisor_user_id`, `start_date`, `end_date`, `status` | referencias verificadas a estudiante, institución y cuenta asesora |
| `hours` | `_id`, `practice_id`, `activity_date`, `hours`, `activity`, `evidence_url`, `review_status` | horas 0–24 por actividad; estudiante crea en estado pendiente |
| `visits` | `_id`, `practice_id`, `visit_date`, `observer_name`, `evaluation`, `observations`, `status` | creada por asesor asociado o administrador/coordinación |
| `validations` | `_id`, `practice_id`, `attendance_status`, `performance_status`, `observations`, `validated_by`, `validated_at` | validación restringida a institución asociada o administración/coordinación |
| `evidence` | `_id`, `practice_id`, `hour_id`, `original_name`, `storage_name`, `mime_type`, `size`, `uploaded_by`, `created_at` | metadatos en MongoDB; binario privado en `uploads/`; descarga autorizada |
| `users` | `_id`, `email`, `full_name`, `role`, `profile_id`, `password_hash`, marcas temporales | correo único; seis roles; acceso por JWT; perfil asociado existente y único por rol |
| `counters` | `_id` (recurso), `sequence` | secuencia atómica para conservar IDs numéricos |
| `revoked_tokens` | `_id` (`jti` JWT), `expires_at` | índice TTL que elimina sesiones revocadas al expirar |

## Relaciones conceptuales

- Un estudiante tiene cero o varias prácticas; cada práctica refiere un estudiante.
- Una institución recibe cero o varias prácticas; cada práctica refiere una institución.
- Una práctica puede tener cero o varias horas, visitas, validaciones y evidencias.
- Una evidencia opcionalmente se asocia a un registro de horas.
- Un usuario estudiante/institución se vincula obligatoriamente a un perfil existente con `profile_id`; no se permite más de una cuenta del mismo rol por perfil. Una práctica puede vincular el usuario asesor en `advisor_user_id`.
- El borrado de estudiante/práctica elimina sus documentos dependientes y archivos asociados. Las instituciones con prácticas activas no se pueden borrar.

## Índices implementados

Únicos: `students.code`, `students.email`, `institutions.name`, `users.email`. Consulta: referencias de prácticas, práctica/fecha en horas y visitas, práctica/creación en evidencias y TTL de sesiones revocadas.

## Consideraciones

Los límites/enum se validan en `src/domain/records.js`; los casos de uso y referencias están en `src/application/records.service.js`, tras los puertos definidos en `src/application/ports.js`. Los índices únicos se preparan en el adaptador `src/config/database.js`. Los diagramas representan relaciones lógicas, no claves foráneas de MongoDB. La meta de 160 horas y los dominios académicos siguen sujetos a validación por el programa.
