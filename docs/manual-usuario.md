# Manual de usuario

## Alcance

La aplicación gestiona prácticas académicas con cuentas autenticadas. Los datos de demostración son ficticios; no uses información real de estudiantes en esta versión académica.

## Primer acceso

1. Solicita al administrador la dirección web y una cuenta personal.
2. Ingresa correo y contraseña en **Iniciar sesión**. El token de acceso dura ocho horas y se conserva únicamente durante la sesión del navegador.
3. Usa **Salir** al terminar. El token se revoca en el servidor.

No hay registro público. El administrador crea las cuentas y asigna uno de estos perfiles: administrador, coordinación, estudiante, docente asesor/a, institución receptora o dirección del programa.

Al crear una cuenta de estudiante o institución, elige el perfil existente correspondiente. Cada perfil solo puede asociarse a una cuenta con ese mismo rol.

## Funciones por perfil

| Perfil | Funciones principales |
|---|---|
| Administrador | Administrar registros, gestionar cuentas y perfiles, consultar informes |
| Coordinación | Administrar estudiantes, instituciones y asignaciones; revisar horas; gestionar visitas y validaciones; consultar informes |
| Estudiante | Consultar sus prácticas, registrar horas y adjuntar evidencias a las prácticas asociadas |
| Docente asesor/a | Consultar prácticas asignadas, revisar horas y registrar visitas/evaluaciones |
| Institución receptora | Consultar prácticas asociadas y registrar validaciones de asistencia y desempeño |
| Dirección del programa | Consultar panel e informes de prácticas de su alcance |

Las operaciones que no correspondan al perfil se deniegan también en la API; ocultar botones en pantalla no es el control de seguridad.

## Operación

### Registros y asignaciones

Selecciona una sección de la navegación. Usa **Nuevo/a** para abrir el formulario, **Guardar** para registrar y los iconos de fila para editar o eliminar cuando tu rol tenga permiso. Los formularios marcan campos obligatorios y muestran errores de validación.

Una asignación requiere estudiante, institución, nombre del asesor/a y fecha de inicio. El ID de cuenta del asesor/a es opcional; si se informa debe corresponder a una cuenta con ese rol. Los registros de horas creados por estudiantes quedan pendientes de revisión y las horas rechazadas no se cuentan en el avance. El panel muestra las horas reales registradas por semana para las 12 semanas recientes. La meta ilustrativa de 160 horas aún debe ser confirmada por el programa.

### Horas y evidencias

El estudiante registra una práctica propia, fecha, horas y actividad. Un registro nuevo queda pendiente de revisión; el estudiante no puede aprobarse sus horas. Un asesor autorizado puede cambiar su estado. Los archivos permitidos son PDF, JPG, PNG, DOCX y PPTX, con tamaño máximo de 10 MB. Los archivos se guardan fuera del directorio público y solo se descargan con una sesión autorizada para esa práctica.

También se puede registrar un enlace externo; el sistema no valida permisos ni disponibilidad de esos enlaces.

### Visitas y validaciones

El asesor registra fecha, evaluación y observaciones de una práctica que tenga asignada. La institución asociada registra estado de asistencia, desempeño y observaciones. Verifica los datos antes de guardar; los registros constituyen evidencia académica y deben revisarse según los procedimientos del programa.

### Informes

Coordinación, administración y dirección pueden consultar totales de prácticas, horas reportadas/aprobadas, visitas y validaciones pendientes. El botón **Descargar CSV** exporta las asignaciones visibles del informe. Los totales son datos operativos; no constituyen una certificación de acreditación ni sustituyen la revisión institucional.

## Ayuda y privacidad

Ante un error, guarda el mensaje y comunícate con coordinación. No compartas tu contraseña, token, enlaces privados ni archivos de otros estudiantes. Cerrar la pestaña no necesariamente ejecuta el cierre de sesión; usa **Salir**.
