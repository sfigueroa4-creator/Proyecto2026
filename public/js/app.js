import { renderServiceCards, runServiceDemo } from './services.js';

const seed = {
  students: [
    { id: 1, code: '20261024', full_name: 'Valentina Rojas', email: 'valentina.rojas@estudiante.edu.co', semester: 5, status: 'En práctica' },
    { id: 2, code: '20261038', full_name: 'Mateo Herrera', email: 'mateo.herrera@estudiante.edu.co', semester: 5, status: 'En práctica' },
    { id: 3, code: '20261057', full_name: 'Sofía Martínez', email: 'sofia.martinez@estudiante.edu.co', semester: 5, status: 'Pendiente' },
    { id: 4, code: '20261072', full_name: 'Daniela Pérez', email: 'daniela.perez@estudiante.edu.co', semester: 5, status: 'En práctica' },
    { id: 5, code: '20261089', full_name: 'Nicolás Castro', email: 'nicolas.castro@estudiante.edu.co', semester: 5, status: 'En práctica' }
  ],
  institutions: [
    { id: 1, name: 'I.E. Los Pinos', city: 'Bucaramanga', contact_name: 'Laura Gómez', contact_email: 'practicas@lospinos.edu.co', agreement_status: 'Vigente' },
    { id: 2, name: 'Colegio Nuevo Horizonte', city: 'Floridablanca', contact_name: 'Andrés Silva', contact_email: 'convenios@nuevohorizonte.edu.co', agreement_status: 'Vigente' },
    { id: 3, name: 'Escuela Normal Superior', city: 'Girón', contact_name: 'Marta Rueda', contact_email: 'practicas@ens.edu.co', agreement_status: 'En trámite' }
  ],
  practices: [
    { id: 1, student_id: 1, student_name: 'Valentina Rojas', student_code: '20261024', institution_id: 1, institution_name: 'I.E. Los Pinos', advisor_name: 'Diana Pardo', start_date: '2026-08-10', status: 'En curso', hours_logged: 112 },
    { id: 2, student_id: 2, student_name: 'Mateo Herrera', student_code: '20261038', institution_id: 2, institution_name: 'Colegio Nuevo Horizonte', advisor_name: 'Carlos Rincón', start_date: '2026-08-17', status: 'En curso', hours_logged: 96 },
    { id: 3, student_id: 3, student_name: 'Sofía Martínez', student_code: '20261057', institution_id: 1, institution_name: 'I.E. Los Pinos', advisor_name: 'Diana Pardo', start_date: '2026-09-02', status: 'Pendiente', hours_logged: 0 },
    { id: 4, student_id: 4, student_name: 'Daniela Pérez', student_code: '20261072', institution_id: 3, institution_name: 'Escuela Normal Superior', advisor_name: 'Julián Mora', start_date: '2026-08-12', status: 'En curso', hours_logged: 128 },
    { id: 5, student_id: 5, student_name: 'Nicolás Castro', student_code: '20261089', institution_id: 2, institution_name: 'Colegio Nuevo Horizonte', advisor_name: 'Carlos Rincón', start_date: '2026-08-20', status: 'En revisión', hours_logged: 74 }
  ],
  hours: [
    { id: 1, practice_id: 1, student_name: 'Valentina Rojas', activity_date: '2026-09-16', hours: 6, activity: 'Observación y planeación de clase', evidence_url: '', review_status: 'Aprobada' },
    { id: 2, practice_id: 2, student_name: 'Mateo Herrera', activity_date: '2026-09-17', hours: 5, activity: 'Apoyo en actividad de lectura', evidence_url: '', review_status: 'Pendiente' },
    { id: 3, practice_id: 4, student_name: 'Daniela Pérez', activity_date: '2026-09-18', hours: 7, activity: 'Diseño de material didáctico', evidence_url: '', review_status: 'Aprobada' }
  ]
};

const config = {
  students: { label: 'Estudiantes', title: 'Estudiantes', singular: 'estudiante', subtitle: 'Consulta y administra los estudiantes vinculados al periodo.', fields: [['code', 'Código estudiantil', 'text', true], ['full_name', 'Nombre completo', 'text', true], ['email', 'Correo institucional', 'email', true], ['semester', 'Semestre', 'number', true], ['status', 'Estado', 'select', true, ['En práctica', 'Pendiente', 'Finalizada']]], columns: [['code', 'Código'], ['full_name', 'Estudiante'], ['email', 'Correo'], ['semester', 'Sem.'], ['status', 'Estado']] },
  institutions: { label: 'Instituciones', title: 'Instituciones receptoras', singular: 'institución', subtitle: 'Instituciones educativas aliadas y estado de sus convenios.', fields: [['name', 'Nombre de la institución', 'text', true], ['city', 'Ciudad', 'text', true], ['contact_name', 'Persona de contacto', 'text', true], ['contact_email', 'Correo de contacto', 'email', true], ['agreement_status', 'Estado del convenio', 'select', true, ['Vigente', 'En trámite', 'Vencido']]], columns: [['name', 'Institución'], ['city', 'Ciudad'], ['contact_name', 'Contacto'], ['contact_email', 'Correo'], ['agreement_status', 'Convenio']] },
  practices: { label: 'Asignaciones', title: 'Asignaciones de práctica', singular: 'asignación', subtitle: 'Asigna estudiantes a instituciones y consulta el avance de sus prácticas.', fields: [['student_id', 'Estudiante', 'student', true], ['institution_id', 'Institución', 'institution', true], ['advisor_name', 'Docente asesor/a', 'text', true], ['start_date', 'Fecha de inicio', 'date', true], ['end_date', 'Fecha de finalización', 'date', false], ['status', 'Estado de la práctica', 'select', true, ['En curso', 'Pendiente', 'Completada', 'En revisión']]], columns: [['student_name', 'Estudiante'], ['institution_name', 'Institución'], ['advisor_name', 'Asesor/a'], ['hours_logged', 'Horas'], ['status', 'Estado']] },
  hours: { label: 'Horas y seguimiento', title: 'Seguimiento de horas', singular: 'registro de horas', subtitle: 'Registra actividades, evidencias y estado de revisión.', fields: [['practice_id', 'Asignación', 'practice', true], ['activity_date', 'Fecha de actividad', 'date', true], ['hours', 'Horas realizadas', 'number', true], ['activity', 'Actividad realizada', 'textarea', true], ['evidence_url', 'Enlace a evidencia (opcional)', 'url', false], ['review_status', 'Estado de revisión', 'select', true, ['Pendiente', 'Aprobada', 'Rechazada']]], columns: [['student_name', 'Estudiante'], ['activity_date', 'Fecha'], ['activity', 'Actividad'], ['hours', 'Horas'], ['review_status', 'Revisión']] }
};

const viewState = { view: 'dashboard', records: {}, editing: null, toastTimer: null };
const el = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const localKey = (resource) => `practicas:${resource}`;
const localRecords = (resource) => JSON.parse(localStorage.getItem(localKey(resource)) || 'null') || structuredClone(seed[resource]);

async function request(resource, method = 'GET', record, id) {
  if (window.location.protocol === 'file:') return { online: false };
  const endpoint = `/api/${resource}${id ? `/${id}` : ''}`;
  try {
    const response = await fetch(endpoint, {
      method,
      headers: record ? { 'Content-Type': 'application/json' } : {},
      body: record ? JSON.stringify(record) : undefined
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || `La solicitud falló (HTTP ${response.status}).`);
    }
    const result = response.status === 204 ? null : await response.json();
    return { online: true, result };
  } catch (error) {
    if (error instanceof TypeError || error.message.includes('Failed to fetch')) return { online: false };
    throw error;
  }
}

async function fetchRecords(resource) {
  const remote = await request(resource);
  if (remote.online) return remote.result;
  return localRecords(resource);
}

async function saveRecord(resource, values, id) {
  const remote = await request(resource, id ? 'PUT' : 'POST', values, id);
  if (!remote.online) {
    const rows = localRecords(resource);
    if (id) {
      const index = rows.findIndex((row) => Number(row.id) === Number(id));
      if (index >= 0) rows[index] = { ...rows[index], ...values };
    } else rows.unshift({ id: Date.now(), ...values });
    if (resource === 'practices') enrichPractices(rows);
    if (resource === 'hours') enrichHours(rows);
    localStorage.setItem(localKey(resource), JSON.stringify(rows));
  }
}

async function deleteRecord(resource, id) {
  const remote = await request(resource, 'DELETE', undefined, id);
  if (!remote.online) {
    if (resource === 'institutions' && localRecords('practices').some((practice) => Number(practice.institution_id) === Number(id))) {
      throw new Error('No se puede eliminar una institución con asignaciones vinculadas.');
    }
    const dependentPracticeIds = resource === 'students'
      ? localRecords('practices').filter((practice) => Number(practice.student_id) === Number(id)).map((practice) => Number(practice.id))
      : resource === 'practices' ? [Number(id)] : [];
    if (dependentPracticeIds.length) {
      const remainingPractices = localRecords('practices').filter((practice) => !dependentPracticeIds.includes(Number(practice.id)));
      localStorage.setItem(localKey('practices'), JSON.stringify(remainingPractices));
      const remainingHours = localRecords('hours').filter((entry) => !dependentPracticeIds.includes(Number(entry.practice_id)));
      localStorage.setItem(localKey('hours'), JSON.stringify(remainingHours));
    }
    const rows = localRecords(resource).filter((row) => Number(row.id) !== Number(id));
    localStorage.setItem(localKey(resource), JSON.stringify(rows));
  }
}

function enrichPractices(practices) {
  const students = localRecords('students');
  const institutions = localRecords('institutions');
  practices.forEach((practice) => {
    const student = students.find((row) => Number(row.id) === Number(practice.student_id));
    const institution = institutions.find((row) => Number(row.id) === Number(practice.institution_id));
    practice.student_name = student?.full_name || practice.student_name || 'Estudiante por asignar';
    practice.student_code = student?.code || practice.student_code || '—';
    practice.institution_name = institution?.name || practice.institution_name || 'Institución por asignar';
    practice.hours_logged ??= localRecords('hours').filter((entry) => Number(entry.practice_id) === Number(practice.id) && entry.review_status !== 'Rechazada').reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
  });
}
function enrichHours(hours) {
  const practices = localRecords('practices');
  const students = localRecords('students');
  hours.forEach((entry) => { entry.student_name ||= students.find((student) => Number(student.id) === Number(practices.find((practice) => Number(practice.id) === Number(entry.practice_id))?.student_id))?.full_name || 'Estudiante'; });
}
function badge(value = '') {
  const normalized = value.toLowerCase().replaceAll(' ', '-').replaceAll('ó', 'o');
  return `<span class="badge badge-${escapeHtml(normalized)}"><i></i>${escapeHtml(value)}</span>`;
}
function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
function formatDate(value) { if (!value) return '—'; const date = new Date(`${String(value).slice(0, 10)}T12:00:00`); return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date); }

async function loadAll() {
  for (const resource of Object.keys(config)) viewState.records[resource] = await fetchRecords(resource);
  enrichPractices(viewState.records.practices);
  enrichHours(viewState.records.hours);
  renderDashboard();
  if (viewState.view !== 'dashboard') renderManagement();
  el('#student-nav-count').textContent = viewState.records.students.length;
}

function renderDashboard() {
  const { students, institutions, practices, hours } = viewState.records;
  const registeredHours = hours.filter((entry) => entry.review_status !== 'Rechazada').reduce((total, entry) => total + Number(entry.hours || 0), 0);
  const activeStudents = students.filter((student) => student.status === 'En práctica').length;
  const currentAssignments = practices.filter((practice) => practice.status !== 'Completada');
  const pending = hours.filter((entry) => entry.review_status === 'Pendiente').length;
  const completion = Math.min(100, Math.round(registeredHours / Math.max(1, activeStudents * 160) * 100));
  el('#stat-students').textContent = String(activeStudents).padStart(2, '0');
  el('#stat-hours').textContent = registeredHours.toLocaleString('es-CO');
  el('#stat-institutions').textContent = String(institutions.filter((institution) => institution.agreement_status === 'Vigente').length).padStart(2, '0');
  el('#stat-pending').textContent = String(pending).padStart(2, '0');
  el('#hours-progress').style.width = `${completion}%`;
  el('#chart-percent').textContent = `${completion}%`;
  const byStatus = ['En curso', 'Pendiente', 'En revisión', 'Completada'].map((status) => ({ status, total: practices.filter((practice) => practice.status === status).length }));
  const maxStatus = Math.max(1, ...byStatus.map((item) => item.total));
  el('#status-list').innerHTML = byStatus.map(({ status, total }) => `<div class="status-row"><span class="status-name"><i class="status-mark status-mark-${status.toLowerCase().replaceAll(' ', '-')}"></i>${escapeHtml(status)}</span><div class="status-track"><i style="width:${Math.round(total / maxStatus * 100)}%"></i></div><b>${total}</b></div>`).join('');
  el('#status-foot-text').textContent = `${currentAssignments.length} asignaciones activas · ${practices.length} en total`;
  const weekValues = [28, 43, 35, 63, 51, 76, 59, 84, 68, 94, 73, 58];
  el('#hours-chart').innerHTML = weekValues.map((value, index) => `<div class="chart-column"><i class="chart-bar ${index === 9 ? 'chart-bar-highlight' : ''}" style="height:${value}%" title="Semana ${index + 1}"></i><small>${index % 2 ? '' : `S${index + 1}`}</small></div>`).join('');
  const recent = [...practices].sort((a, b) => String(b.start_date).localeCompare(String(a.start_date))).slice(0, 5);
  el('#recent-table').innerHTML = recent.map((practice, index) => {
    const progress = Math.min(100, Math.round(Number(practice.hours_logged || 0) / 160 * 100));
    return `<tr><td><div class="person-cell"><div class="avatar avatar-${index % 4}">${escapeHtml(initials(practice.student_name))}</div><span><b>${escapeHtml(practice.student_name)}</b><small>${escapeHtml(practice.student_code || 'Practicante')}</small></span></div></td><td>${escapeHtml(practice.institution_name)}</td><td><div class="table-progress"><span>${progress}%</span><i><b style="width:${progress}%"></b></i></div></td><td>${badge(practice.status)}</td><td><button class="row-action" data-edit-resource="practices" data-id="${practice.id}" aria-label="Editar asignación">···</button></td></tr>`;
  }).join('') || '<tr><td colspan="5" class="table-empty">Aún no hay asignaciones registradas.</td></tr>';
  el('#recent-table').querySelectorAll('[data-edit-resource]').forEach((button) => button.addEventListener('click', () => openDialog('practices', Number(button.dataset.id))));
}

function displayValue(resource, field, value, row) {
  if (field === 'student_name' && resource === 'hours' && !value) return row.student_name || 'Estudiante';
  if (field === 'student_name' && resource === 'practices' && !value) return row.student_name || 'Estudiante';
  if (field === 'institution_name' && !value) return row.institution_name || 'Institución';
  if (field === 'activity_date' || field.endsWith('_date')) return formatDate(value);
  if (field === 'hours') return `${Number(value || 0)} h`;
  return value ?? '—';
}
function renderManagement() {
  const resource = viewState.view;
  const definition = config[resource];
  if (!definition) return;
  el('#table-title').textContent = definition.title;
  el('#table-subtitle').textContent = definition.subtitle;
  const columns = definition.columns;
  el('#management-head').innerHTML = `<tr>${columns.map(([, title]) => `<th>${escapeHtml(title.toUpperCase())}</th>`).join('')}<th></th></tr>`;
  const query = el('#search-input').value.trim().toLowerCase();
  const rows = viewState.records[resource].filter((row) => columns.some(([field]) => String(displayValue(resource, field, row[field], row)).toLowerCase().includes(query)));
  const personColumn = resource === 'students' ? 'full_name' : resource === 'practices' ? 'student_name' : null;
  el('#management-body').innerHTML = rows.map((row, index) => `<tr>${columns.map(([field]) => {
    const value = displayValue(resource, field, row[field], row);
    if (field === 'status' || field === 'agreement_status' || field === 'review_status') return `<td>${badge(String(value))}</td>`;
    if (field === 'hours_logged') return `<td><div class="table-progress"><span>${Number(value || 0)} / 160 h</span><i><b style="width:${Math.min(100, Math.round(Number(value || 0) / 160 * 100))}%"></b></i></div></td>`;
    if (field === personColumn) return `<td><div class="person-cell"><div class="avatar avatar-${index % 4}">${escapeHtml(initials(String(value)))}</div><span><b>${escapeHtml(String(value))}</b>${resource === 'students' ? `<small>${escapeHtml(row.code)}</small>` : ''}</span></div></td>`;
    return `<td>${escapeHtml(String(value))}</td>`;
  }).join('')}<td><div class="row-actions"><button class="row-action" data-edit="${row.id}" aria-label="Editar">✎</button><button class="row-action row-action-danger" data-delete="${row.id}" aria-label="Eliminar">×</button></div></td></tr>`).join('');
  el('#record-count').textContent = `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}`;
  el('#empty-state').hidden = rows.length > 0;
  el('#management-body').hidden = rows.length === 0;
  el('#management-body').querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => openDialog(resource, Number(button.dataset.edit))));
  el('#management-body').querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => removeRow(resource, Number(button.dataset.delete))));
}

function setView(view) {
  viewState.view = view;
  const definition = config[view];
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  el('#dashboard-view').hidden = view !== 'dashboard';
  el('#management-view').hidden = view === 'dashboard';
  el('#breadcrumb-current').textContent = definition?.label || 'Resumen';
  el('#page-eyebrow').innerHTML = definition ? `GESTIÓN DE PRÁCTICAS <span>·</span> ${escapeHtml(definition.label.toUpperCase())}` : 'VISTA GENERAL <span>·</span> PERIODO 2026–2';
  el('#page-title').innerHTML = definition ? `${escapeHtml(definition.title)} <span class="wave">✳</span>` : 'Buenos días, coordinación <span class="wave">✳</span>';
  el('#page-subtitle').textContent = definition?.subtitle || 'Aquí tienes el estado actual de las prácticas del programa.';
  el('#add-button').innerHTML = `<span>＋</span> ${definition ? `Nuevo/a ${definition.singular}` : 'Nueva asignación'}`;
  el('#search-input').value = '';
  el('#sidebar').classList.remove('sidebar-open');
  if (definition) renderManagement();
}

function selectOptions(resource, field) {
  const source = viewState.records[resource] || [];
  if (field === 'student') return source.map((row) => `<option value="${row.id}">${escapeHtml(row.full_name)} · ${escapeHtml(row.code)}</option>`).join('');
  if (field === 'institution') return source.map((row) => `<option value="${row.id}">${escapeHtml(row.name)} · ${escapeHtml(row.city)}</option>`).join('');
  if (field === 'practice') return source.map((row) => `<option value="${row.id}">${escapeHtml(row.student_name)} · ${escapeHtml(row.institution_name)}</option>`).join('');
  return '';
}
function openDialog(resource, id) {
  const definition = config[resource];
  const row = viewState.records[resource].find((entry) => Number(entry.id) === Number(id));
  viewState.editing = row ? { resource, id } : null;
  el('#dialog-title').textContent = row ? `Editar ${definition.singular}` : `Nuevo/a ${definition.singular}`;
  el('#form-fields').innerHTML = definition.fields.map(([field, label, type, required, options]) => {
    const value = row?.[field] ?? (field === 'semester' ? 5 : '');
    if (type === 'select') return `<label class="form-field"><span>${escapeHtml(label)}${required ? ' *' : ''}</span><select name="${field}" ${required ? 'required' : ''}>${options.map((option) => `<option ${String(value) === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
    if (['student', 'institution', 'practice'].includes(type)) {
      const source = type === 'student' ? 'students' : type === 'institution' ? 'institutions' : 'practices';
      return `<label class="form-field"><span>${escapeHtml(label)} *</span><select name="${field}" required>${selectOptions(source, type)}</select></label>`;
    }
    if (type === 'textarea') return `<label class="form-field form-field-wide"><span>${escapeHtml(label)} *</span><textarea name="${field}" rows="3" required>${escapeHtml(value)}</textarea></label>`;
    return `<label class="form-field"><span>${escapeHtml(label)}${required ? ' *' : ''}</span><input name="${field}" type="${type}" value="${escapeHtml(value)}" ${required ? 'required' : ''} ${type === 'number' ? 'min="0" step="1"' : ''}></label>`;
  }).join('');
  el('#record-dialog').showModal();
}
async function handleSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const values = Object.fromEntries(form.entries());
  const resource = viewState.editing?.resource || viewState.view;
  for (const key of ['semester', 'student_id', 'institution_id', 'practice_id', 'hours']) if (key in values) values[key] = Number(values[key]);
  try {
    await saveRecord(resource, values, viewState.editing?.id);
    el('#record-dialog').close();
    await loadAll();
    renderManagement();
    showToast(viewState.editing ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.');
    viewState.editing = null;
  } catch (error) { showToast(error.message, true); }
}
async function removeRow(resource, id) {
  if (!confirm('¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.')) return;
  try { await deleteRecord(resource, id); await loadAll(); renderManagement(); showToast('Registro eliminado.'); }
  catch (error) { showToast(error.message, true); }
}
function showToast(message, error = false) {
  const toast = el('#toast'); toast.textContent = message; toast.classList.toggle('toast-error', error); toast.classList.add('toast-visible');
  clearTimeout(viewState.toastTimer); viewState.toastTimer = setTimeout(() => toast.classList.remove('toast-visible'), 3000);
}
function exportCsv() {
  const resource = viewState.view === 'dashboard' ? 'practices' : viewState.view;
  const definition = config[resource];
  const rows = viewState.records[resource];
  const csv = [definition.columns.map(([, title]) => title).join(','), ...rows.map((row) => definition.columns.map(([field]) => `"${String(displayValue(resource, field, row[field], row)).replaceAll('"', '""')}"`).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `${resource}-practicas-2026-2.csv`; link.click(); URL.revokeObjectURL(url);
}

renderServiceCards();
document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelectorAll('[data-goto]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.goto)));
el('#add-button').addEventListener('click', () => openDialog(viewState.view === 'dashboard' ? 'practices' : viewState.view));
el('#empty-add').addEventListener('click', () => openDialog(viewState.view));
el('#record-form').addEventListener('submit', handleSubmit);
el('#dialog-close').addEventListener('click', () => el('#record-dialog').close());
el('#cancel-button').addEventListener('click', () => el('#record-dialog').close());
el('#search-input').addEventListener('input', renderManagement);
el('#export-button').addEventListener('click', exportCsv);
el('#service-demo').addEventListener('click', runServiceDemo);
el('#mobile-menu').addEventListener('click', () => el('#sidebar').classList.toggle('sidebar-open'));
loadAll().catch((error) => showToast(error.message, true));
