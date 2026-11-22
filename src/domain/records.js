const definitions = {
  students: {
    fields: ['code', 'full_name', 'email', 'semester', 'status', 'user_id'],
    required: ['code', 'full_name', 'email'],
    defaults: { semester: 5, status: 'Pendiente' },
    enums: { status: ['En práctica', 'Pendiente', 'Finalizada'] }
  },
  institutions: {
    fields: ['name', 'city', 'contact_name', 'contact_email', 'agreement_status', 'user_id'],
    required: ['name', 'city', 'contact_name', 'contact_email'],
    defaults: { agreement_status: 'En trámite' },
    enums: { agreement_status: ['Vigente', 'En trámite', 'Vencido'] }
  },
  practices: {
    fields: ['student_id', 'institution_id', 'advisor_name', 'advisor_user_id', 'start_date', 'end_date', 'status'],
    required: ['student_id', 'institution_id', 'advisor_name', 'start_date'],
    defaults: { status: 'Pendiente' },
    enums: { status: ['En curso', 'Pendiente', 'Completada', 'En revisión'] }
  },
  hours: {
    fields: ['practice_id', 'activity_date', 'hours', 'activity', 'evidence_url', 'review_status'],
    required: ['practice_id', 'activity_date', 'hours', 'activity'],
    defaults: { review_status: 'Pendiente' },
    enums: { review_status: ['Pendiente', 'Aprobada', 'Rechazada'] }
  },
  visits: {
    fields: ['practice_id', 'visit_date', 'observer_name', 'evaluation', 'observations', 'status'],
    required: ['practice_id', 'visit_date', 'observer_name', 'evaluation'],
    defaults: { status: 'Realizada' },
    enums: { evaluation: ['Insuficiente', 'En desarrollo', 'Satisfactoria', 'Destacada'] }
  },
  validations: {
    fields: ['practice_id', 'attendance_status', 'performance_status', 'observations'],
    required: ['practice_id', 'attendance_status', 'performance_status'],
    defaults: { attendance_status: 'Pendiente', performance_status: 'Pendiente' },
    enums: {
      attendance_status: ['Pendiente', 'Validada', 'Rechazada'],
      performance_status: ['Pendiente', 'Satisfactoria', 'Requiere seguimiento', 'Insatisfactoria']
    }
  }
};

export const roleNames = ['admin', 'coordinator', 'student', 'advisor', 'institution', 'director'];
export const role = (user) => user?.role;
export const isManager = (user) => ['admin', 'coordinator'].includes(role(user));
export const numericId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
export const domainError = (message, status = 400) => Object.assign(new Error(message), { status });

export function resourceConfig(resource) {
  const config = definitions[resource];
  if (!config) throw domainError('Recurso no encontrado.', 404);
  return config;
}

export function validateInput(resource, input, partial = false) {
  const config = resourceConfig(resource);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw domainError('Envía un objeto JSON.');
  const unknown = Object.keys(input).filter((key) => !config.fields.includes(key));
  if (unknown.length) throw domainError(`Campos no permitidos: ${unknown.join(', ')}.`);
  for (const field of config.required) {
    if (!partial && (input[field] === undefined || input[field] === null || input[field] === '')) {
      throw domainError(`El campo ${field} es obligatorio.`);
    }
  }
  for (const [field, values] of Object.entries(config.enums || {})) {
    if (input[field] !== undefined && !values.includes(input[field])) {
      throw domainError(`El valor de ${field} no es válido.`);
    }
  }
  for (const field of ['semester', 'student_id', 'institution_id', 'practice_id', 'advisor_user_id', 'user_id']) {
    if (input[field] !== undefined && input[field] !== null && !numericId(input[field])) {
      throw domainError(`El campo ${field} debe ser un identificador entero positivo.`);
    }
  }
  if (input.hours !== undefined && (!Number.isFinite(Number(input.hours)) || Number(input.hours) <= 0 || Number(input.hours) > 24)) {
    throw domainError('Las horas deben ser mayores que cero y no superar 24 por actividad.');
  }
  for (const field of ['start_date', 'end_date', 'activity_date', 'visit_date']) {
    if (input[field] !== undefined && input[field] !== null && input[field] !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(input[field])) {
      throw domainError(`El campo ${field} debe tener formato AAAA-MM-DD.`);
    }
    if (input[field]) {
      const date = new Date(`${input[field]}T00:00:00.000Z`);
      if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== input[field]) throw domainError(`El campo ${field} no es una fecha válida.`);
    }
  }
  if (input.start_date && input.end_date && input.end_date < input.start_date) throw domainError('La fecha de finalización no puede ser anterior a la fecha de inicio.');
  return Object.fromEntries(Object.entries(input).filter(([key]) => config.fields.includes(key)));
}
