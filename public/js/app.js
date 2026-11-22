import { renderServiceCards, runServiceDemo } from './services.js';
import { weeklyHours } from './dashboard.js';

const config = {
  students: { label: 'Estudiantes', title: 'Estudiantes', singular: 'estudiante', subtitle: 'Gestiona los perfiles de estudiantes.', fields: [['code', 'Código', 'text', true], ['full_name', 'Nombre completo', 'text', true], ['email', 'Correo', 'email', true], ['semester', 'Semestre', 'number', true], ['status', 'Estado', 'select', true, ['En práctica', 'Pendiente', 'Finalizada']]], columns: [['code', 'Código'], ['full_name', 'Estudiante'], ['email', 'Correo'], ['semester', 'Semestre'], ['status', 'Estado']] },
  institutions: { label: 'Instituciones', title: 'Instituciones', singular: 'institución', subtitle: 'Instituciones receptoras y sus convenios.', fields: [['name', 'Nombre', 'text', true], ['city', 'Ciudad', 'text', true], ['contact_name', 'Contacto', 'text', true], ['contact_email', 'Correo de contacto', 'email', true], ['agreement_status', 'Convenio', 'select', true, ['Vigente', 'En trámite', 'Vencido']]], columns: [['name', 'Institución'], ['city', 'Ciudad'], ['contact_name', 'Contacto'], ['agreement_status', 'Convenio']] },
  practices: { label: 'Asignaciones', title: 'Asignaciones de práctica', singular: 'asignación', subtitle: 'Vincula estudiantes, instituciones y asesores.', fields: [['student_id', 'Estudiante', 'student', true], ['institution_id', 'Institución', 'institution', true], ['advisor_name', 'Docente asesor/a', 'text', true], ['advisor_user_id', 'ID de cuenta asesora (opcional)', 'number', false], ['start_date', 'Fecha de inicio', 'date', true], ['end_date', 'Fecha de finalización', 'date', false], ['status', 'Estado', 'select', true, ['En curso', 'Pendiente', 'Completada', 'En revisión']], ['evidence_file', 'Plan de clase o evidencia (PDF, JPG, PNG, DOCX o PPTX; máx. 10 MB)', 'file', false]], columns: [['student_name', 'Estudiante'], ['institution_name', 'Institución'], ['advisor_name', 'Asesor/a'], ['hours_logged', 'Horas'], ['status', 'Estado'], ['evidence', 'Documentos']] },
  hours: { label: 'Horas y seguimiento', title: 'Registros de horas', singular: 'registro de horas', subtitle: 'Registra actividades y evidencias.', fields: [['practice_id', 'Asignación', 'practice', true], ['activity_date', 'Fecha', 'date', true], ['hours', 'Horas', 'number', true], ['activity', 'Actividad', 'textarea', true], ['evidence_url', 'Enlace externo (opcional)', 'url', false], ['evidence_file', 'Archivo PDF, JPG, PNG, DOCX o PPTX (máx. 10 MB)', 'file', false], ['review_status', 'Estado de revisión', 'select', true, ['Pendiente', 'Aprobada', 'Rechazada']]], columns: [['student_name', 'Estudiante'], ['activity_date', 'Fecha'], ['activity', 'Actividad'], ['hours', 'Horas'], ['review_status', 'Revisión'], ['evidence', 'Archivos']] },
  visits: { label: 'Visitas y evaluación', title: 'Visitas pedagógicas', singular: 'visita', subtitle: 'Registra observaciones y evaluación del asesor.', fields: [['practice_id', 'Asignación', 'practice', true], ['visit_date', 'Fecha', 'date', true], ['observer_name', 'Asesor/a', 'text', true], ['evaluation', 'Evaluación', 'select', true, ['Insuficiente', 'En desarrollo', 'Satisfactoria', 'Destacada']], ['observations', 'Observaciones', 'textarea', false]], columns: [['student_name', 'Estudiante'], ['visit_date', 'Fecha'], ['observer_name', 'Asesor/a'], ['evaluation', 'Evaluación'], ['observations', 'Observaciones']] },
  validations: { label: 'Validación institucional', title: 'Validación de asistencia y desempeño', singular: 'validación', subtitle: 'Registra la revisión de la institución receptora.', fields: [['practice_id', 'Asignación', 'practice', true], ['attendance_status', 'Asistencia', 'select', true, ['Pendiente', 'Validada', 'Rechazada']], ['performance_status', 'Desempeño', 'select', true, ['Pendiente', 'Satisfactoria', 'Requiere seguimiento', 'Insatisfactoria']], ['observations', 'Observaciones', 'textarea', false]], columns: [['student_name', 'Estudiante'], ['attendance_status', 'Asistencia'], ['performance_status', 'Desempeño'], ['observations', 'Observaciones']] },
  users: { label: 'Usuarios', title: 'Cuentas y roles', singular: 'usuario', subtitle: 'Crea cuentas y vincula estudiantes e instituciones con su perfil.', fields: [['full_name', 'Nombre completo', 'text', true], ['email', 'Correo', 'email', true], ['password', 'Contraseña (mínimo 12 caracteres)', 'password', true], ['role', 'Rol', 'select', true, ['admin', 'coordinator', 'student', 'advisor', 'institution', 'director']], ['profile_id', 'Perfil asociado', 'profile', false]], columns: [['full_name', 'Nombre'], ['email', 'Correo'], ['role', 'Rol']] }
};

const roleLabels = { admin: 'Administrador', coordinator: 'Coordinación', student: 'Estudiante', advisor: 'Docente asesor/a', institution: 'Institución receptora', director: 'Dirección del programa' };
const viewState = { view: 'dashboard', records: {}, editing: null, toastTimer: null, user: null };
const el = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const authToken = () => sessionStorage.getItem('practicas:token');
const managers = ['admin', 'coordinator'];

async function api(url, { method = 'GET', body, form = false, authenticated = true } = {}) {
  const headers = {};
  if (body && !form) headers['Content-Type'] = 'application/json';
  if (authenticated && authToken()) headers.Authorization = 'Bearer ' + authToken();
  const response = await fetch(url.startsWith('/api/') ? url : `/api/${url}`, {
    method, headers, body: body ? (form ? body : JSON.stringify(body)) : undefined
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 && authenticated) signOut();
    throw new Error(payload.error || `La solicitud falló (HTTP ${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

function canWrite(resource, action = 'create') {
  if (managers.includes(viewState.user?.role)) return true;
  if (resource === 'hours' && action === 'create') return viewState.user?.role === 'student';
  if (resource === 'hours' && action === 'update') return viewState.user?.role === 'advisor';
  if (resource === 'visits' && ['create', 'update'].includes(action)) return viewState.user?.role === 'advisor';
  if (resource === 'validations' && ['create', 'update'].includes(action)) return viewState.user?.role === 'institution';
  return false;
}

function signOut() {
  const token = authToken();
  if (token) {
    fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } })
      .catch((error) => console.error('No se pudo revocar la sesión en el servidor:', error));
  }
  sessionStorage.removeItem('practicas:token');
  viewState.user = null;
  el('#app-shell').hidden = true;
  const dialog = el('#login-dialog');
  if (!dialog.open) dialog.showModal();
}

async function activateUser(user) {
  viewState.user = user;
  el('#login-dialog').close();
  el('#app-shell').hidden = false;
  el('#user-name').textContent = user.full_name;
  el('#user-role').textContent = roleLabels[user.role] || user.role;
  el('#user-avatar').textContent = user.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  document.querySelectorAll('.nav-item[data-roles]').forEach((button) => {
    button.hidden = !button.dataset.roles.split(' ').includes(user.role);
  });
  const firstView = document.querySelector('.nav-item:not([hidden])')?.dataset.view || 'practices';
  viewState.view = firstView;
  await loadAll();
  setView(firstView);
}

async function requestResource(resource, method = 'GET', body, id) {
  const suffix = id ? `/${id}` : '';
  return api(`${resource}${suffix}`, { method, body });
}

async function loadAll() {
  const resources = Object.keys(config).filter((resource) => resource !== 'users' || viewState.user.role === 'admin');
  const records = await Promise.all(resources.map((resource) => requestResource(resource)));
  resources.forEach((resource, index) => { viewState.records[resource] = records[index]; });
  if (viewState.user.role !== 'admin') viewState.records.users = [];
  el('#sync-status').textContent = `Actualizado ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
  el('#topbar-avatar').textContent = initials(viewState.user.full_name);
  renderDashboard();
  if (viewState.view === 'reports') await renderReports();
  else if (viewState.view !== 'dashboard') renderManagement();
  el('#student-nav-count').textContent = String(viewState.records.students?.length || 0);
}

function badge(value = '') {
  const normalized = value.toLowerCase().replaceAll(' ', '-').replaceAll('ó', 'o');
  return `<span class="badge badge-${escapeHtml(normalized)}"><i></i>${escapeHtml(value)}</span>`;
}
function initials(name = '') { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.valueOf()) ? '—' : new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function renderDashboard() {
  const { students = [], institutions = [], practices = [], hours = [] } = viewState.records;
  const registeredHours = hours.filter((entry) => entry.review_status !== 'Rechazada').reduce((total, entry) => total + Number(entry.hours || 0), 0);
  const activeStudents = students.filter((student) => student.status === 'En práctica').length;
  const currentAssignments = practices.filter((practice) => practice.status !== 'Completada');
  const pending = hours.filter((entry) => entry.review_status === 'Pendiente').length;
  const targetHours = 160;
  const completion = Math.min(100, Math.round(registeredHours / Math.max(1, activeStudents * targetHours) * 100));
  el('#stat-students').textContent = String(activeStudents).padStart(2, '0');
  el('#stat-hours').textContent = registeredHours.toLocaleString('es-CO');
  el('#stat-institutions').textContent = String(institutions.filter((item) => item.agreement_status === 'Vigente').length).padStart(2, '0');
  el('#stat-pending').textContent = String(pending).padStart(2, '0');
  el('#hours-progress').style.width = `${completion}%`;
  el('#chart-percent').textContent = `${completion}%`;
  const statuses = ['En curso', 'Pendiente', 'En revisión', 'Completada'].map((status) => ({ status, total: practices.filter((item) => item.status === status).length }));
  const maxStatus = Math.max(1, ...statuses.map((item) => item.total));
  el('#status-list').innerHTML = statuses.map(({ status, total }) => `<div class="status-row"><span class="status-name"><i class="status-mark status-mark-${status.toLowerCase().replaceAll(' ', '-')}"></i>${escapeHtml(status)}</span><div class="status-track"><i style="width:${Math.round(total / maxStatus * 100)}%"></i></div><b>${total}</b></div>`).join('');
  el('#status-foot-text').textContent = `${currentAssignments.length} asignaciones activas · ${practices.length} en total`;
  const weeks = weeklyHours(hours);
  const maxWeek = Math.max(1, ...weeks.map((week) => week.hours));
  el('#hours-chart').innerHTML = weeks.map((week, index) => {
    const height = Math.round(week.hours / maxWeek * 100);
    return `<div class="chart-column"><i class="chart-bar ${index === weeks.length - 1 ? 'chart-bar-highlight' : ''}" style="height:${height}%" title="${escapeHtml(week.weekOf)} · ${week.hours} h"></i><small>${index % 2 ? '' : week.label}</small></div>`;
  }).join('');
  const recent = [...practices].sort((a, b) => String(b.start_date).localeCompare(String(a.start_date))).slice(0, 5);
  el('#recent-table').innerHTML = recent.map((practice, index) => {
    const progress = Math.min(100, Math.round(Number(practice.hours_logged || 0) / targetHours * 100));
    return `<tr><td><div class="person-cell"><div class="avatar avatar-${index % 4}">${escapeHtml(initials(practice.student_name))}</div><span><b>${escapeHtml(practice.student_name)}</b><small>${escapeHtml(practice.student_code || 'Practicante')}</small></span></div></td><td>${escapeHtml(practice.institution_name)}</td><td><div class="table-progress"><span>${progress}%</span><i><b style="width:${progress}%"></b></i></div></td><td>${badge(practice.status)}</td><td></td></tr>`;
  }).join('') || '<tr><td colspan="5" class="table-empty">Aún no hay asignaciones registradas.</td></tr>';
}

function displayValue(resource, field, value, row) {
  if (field === 'activity_date' || field.endsWith('_date')) return formatDate(value);
  if (field === 'hours') return `${Number(value || 0)} h`;
  if (field === 'evidence') return (row.evidence || []).map((file) => `<button class="text-button" data-download="${file.id}">${escapeHtml(file.original_name)}</button>`).join('<br>') || '—';
  return value ?? '—';
}

function renderManagement() {
  const resource = viewState.view;
  const definition = config[resource];
  const records = viewState.records[resource] || [];
  if (!definition) return;
  el('#table-title').textContent = definition.title;
  el('#table-subtitle').textContent = definition.subtitle;
  el('#management-head').innerHTML = `<tr>${definition.columns.map(([, title]) => `<th>${escapeHtml(title.toUpperCase())}</th>`).join('')}<th></th></tr>`;
  const query = el('#search-input').value.trim().toLowerCase();
  const rows = records.filter((row) => definition.columns.some(([field]) => String(field === 'evidence' ? (row.evidence || []).map((file) => file.original_name).join(' ') : displayValue(resource, field, row[field], row)).toLowerCase().includes(query)));
  el('#management-body').innerHTML = rows.map((row) => {
    const cells = definition.columns.map(([field]) => {
      const value = displayValue(resource, field, row[field], row);
      if (field === 'evidence') return `<td>${value}</td>`;
      if (['status', 'agreement_status', 'review_status', 'attendance_status', 'performance_status', 'evaluation', 'role'].includes(field)) return `<td>${badge(String(value))}</td>`;
      return `<td>${escapeHtml(String(value))}</td>`;
    }).join('');
    const actions = resource === 'users' ? '' : `<div class="row-actions">${canWrite(resource, 'update') ? `<button class="row-action" data-edit="${row.id}" aria-label="Editar">✎</button>` : ''}${canWrite(resource, 'delete') ? `<button class="row-action row-action-danger" data-delete="${row.id}" aria-label="Eliminar">×</button>` : ''}</div>`;
    return `<tr>${cells}<td>${actions}</td></tr>`;
  }).join('');
  el('#record-count').textContent = `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}`;
  el('#empty-state').hidden = rows.length > 0;
  el('#management-body').hidden = rows.length === 0;
  el('#management-body').querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => openDialog(resource, Number(button.dataset.edit))));
  el('#management-body').querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => removeRow(resource, Number(button.dataset.delete))));
  el('#management-body').querySelectorAll('[data-download]').forEach((button) => button.addEventListener('click', () => downloadEvidence(Number(button.dataset.download))));
}

async function renderReports() {
  const report = await api('reports');
  el('#report-generated').textContent = `Generado: ${new Date(report.generated_at).toLocaleString('es-CO')}`;
  const cards = [
    ['Prácticas', report.totals.practices],
    ['Horas reportadas', report.totals.hours_reported],
    ['Horas aprobadas', report.totals.hours_approved],
    ['Registros pendientes', report.totals.pending_hours],
    ['Visitas', report.totals.visits],
    ['Validaciones pendientes', report.totals.pending_validations]
  ];
  el('#report-totals').innerHTML = cards.map(([label, value]) => `<article class="stat-card"><div class="stat-top">${escapeHtml(label)}</div><div class="stat-value">${escapeHtml(String(value))}</div></article>`).join('');
  const columns = [['student_name', 'Estudiante'], ['institution_name', 'Institución'], ['advisor_name', 'Asesor/a'], ['hours_logged', 'Horas'], ['status', 'Estado']];
  el('#report-head').innerHTML = `<tr>${columns.map(([, label]) => `<th>${label}</th>`).join('')}</tr>`;
  el('#report-body').innerHTML = report.practices.map((row) => `<tr><td>${escapeHtml(row.student_name)}</td><td>${escapeHtml(row.institution_name)}</td><td>${escapeHtml(row.advisor_name)}</td><td>${Number(row.hours_logged || 0)}</td><td>${badge(row.status)}</td></tr>`).join('') || '<tr><td colspan="5">Sin registros para el informe.</td></tr>';
}

function setView(view) {
  viewState.view = view;
  const definition = config[view];
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  el('#dashboard-view').hidden = view !== 'dashboard';
  el('#management-view').hidden = view === 'dashboard' || view === 'reports';
  el('#report-view').hidden = view !== 'reports';
  const title = definition?.title || (view === 'reports' ? 'Informes de seguimiento' : 'Resumen');
  el('#breadcrumb-current').textContent = definition?.label || title;
  el('#page-eyebrow').textContent = definition ? `GESTIÓN DE PRÁCTICAS · ${definition.label.toUpperCase()}` : 'VISTA GENERAL · PERIODO 2026–2';
  el('#page-title').textContent = title;
  el('#page-subtitle').textContent = definition?.subtitle || 'Estado actual de las prácticas del programa.';
  const add = view !== 'reports' && definition && canWrite(view, 'create');
  el('#add-button').hidden = !add;
  el('#add-button').textContent = add ? `＋ Nuevo/a ${definition.singular}` : '';
  el('#export-button').hidden = view === 'users' || view === 'reports';
  el('#search-input').value = '';
  el('#sidebar').classList.remove('sidebar-open');
  if (view === 'reports') renderReports().catch((error) => showToast(error.message, true));
  else if (definition) renderManagement();
}

function selectOptions(resource, type, selected) {
  const source = viewState.records[resource] || [];
  const values = type === 'student'
    ? source.map((row) => [row.id, `${row.full_name} · ${row.code}`])
    : type === 'institution'
      ? source.map((row) => [row.id, `${row.name} · ${row.city}`])
      : source.map((row) => [row.id, `${row.student_name || 'Estudiante'} · ${row.institution_name || 'Institución'}`]);
  return values.map(([id, label]) => `<option value="${id}" ${String(selected) === String(id) ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function openDialog(resource, id) {
  const definition = config[resource];
  const row = (viewState.records[resource] || []).find((entry) => Number(entry.id) === Number(id));
  viewState.editing = row ? { resource, id: Number(id) } : null;
  el('#dialog-title').textContent = row ? `Editar ${definition.singular}` : `Nuevo/a ${definition.singular}`;
  const fields = resource === 'hours' && viewState.user.role === 'advisor'
    ? definition.fields.filter(([field]) => field === 'review_status')
    : resource === 'hours' && viewState.user.role === 'student'
      ? definition.fields.filter(([field]) => field !== 'review_status')
      : definition.fields;
  el('#form-fields').innerHTML = fields.map(([field, label, type, required, options]) => {
    const value = row?.[field] ?? (field === 'semester' ? 5 : '');
    if (type === 'select') return `<label class="form-field"><span>${escapeHtml(label)}${required ? ' *' : ''}</span><select name="${field}" ${required ? 'required' : ''}>${options.map((option) => `<option value="${escapeHtml(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
    if (type === 'profile') return `<label class="form-field"><span>${escapeHtml(label)}</span><select name="${field}" disabled><option value="">Selecciona un perfil…</option></select></label>`;
    if (['student', 'institution', 'practice'].includes(type)) {
      const source = type === 'student' ? 'students' : type === 'institution' ? 'institutions' : 'practices';
      return `<label class="form-field"><span>${escapeHtml(label)}${required ? ' *' : ''}</span><select name="${field}" ${required ? 'required' : ''}><option value="">Selecciona…</option>${selectOptions(source, type, value)}</select></label>`;
    }
    const input = type === 'textarea'
      ? `<textarea name="${field}" rows="3" ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>`
      : `<input name="${field}" type="${type}" value="${type === 'file' ? '' : escapeHtml(value)}" ${type === 'file' ? 'accept=".pdf,.jpg,.jpeg,.png,.docx,.pptx"' : ''} ${required ? 'required' : ''} ${type === 'number' ? 'min="0" step="any"' : ''}>`;
    return `<label class="form-field ${type === 'textarea' ? 'form-field-wide' : ''}"><span>${escapeHtml(label)}${required ? ' *' : ''}</span>${input}</label>`;
  }).join('');
  if (resource === 'users') {
    const roleField = el('#form-fields [name="role"]');
    const profileField = el('#form-fields [name="profile_id"]');
    const profileLabel = profileField.closest('label').querySelector('span');
    const syncProfileField = () => {
      const linkedRole = roleField.value === 'student' || roleField.value === 'institution';
      const resource = roleField.value === 'student' ? 'students' : 'institutions';
      const records = linkedRole ? viewState.records[resource] || [] : [];
      profileField.innerHTML = `<option value="">Selecciona un perfil…</option>${records.map((record) => {
        const label = resource === 'students'
          ? `${record.code} · ${record.full_name}`
          : `${record.name} · ${record.city}`;
        return `<option value="${record.id}">${escapeHtml(label)}</option>`;
      }).join('')}`;
      profileField.required = linkedRole;
      profileField.disabled = !linkedRole;
      profileLabel.textContent = linkedRole
        ? `Perfil de ${roleField.value === 'student' ? 'estudiante' : 'institución'} *`
        : 'Perfil asociado (no aplica a este rol)';
    };
    roleField.addEventListener('change', syncProfileField);
    syncProfileField();
  }
  if (row && resource === 'users') el('#form-fields').querySelector('[name="password"]').required = false;
  el('#record-dialog').showModal();
}

async function uploadEvidence(file, practiceId, hourId) {
  const data = new FormData();
  data.append('file', file);
  data.append('practice_id', String(practiceId));
  data.append('hour_id', String(hourId));
  return api('evidence', { method: 'POST', body: data, form: true });
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const file = data.get('evidence_file');
  const values = Object.fromEntries([...data.entries()].filter(([key, value]) => key !== 'evidence_file' && value !== ''));
  const resource = viewState.editing?.resource || viewState.view;
  for (const key of ['semester', 'student_id', 'institution_id', 'practice_id', 'hours', 'advisor_user_id', 'profile_id']) {
    if (key in values) values[key] = Number(values[key]);
  }
  try {
    const saved = await requestResource(resource, viewState.editing ? 'PUT' : 'POST', values, viewState.editing?.id);
    if (file instanceof File && file.size > 0) {
      const practiceId = resource === 'practices' ? Number(viewState.editing?.id || saved.id) : Number(values.practice_id);
      const hourId = resource === 'hours' ? (viewState.editing?.id || saved.id) : null;
      await uploadEvidence(file, practiceId, hourId);
    }
    el('#record-dialog').close();
    await loadAll();
    if (viewState.view !== 'dashboard') renderManagement();
    showToast(viewState.editing ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.');
    viewState.editing = null;
  } catch (error) { showToast(error.message, true); }
}

async function downloadEvidence(id) {
  try {
    const response = await fetch(`/api/evidence/${id}/download`, { headers: { Authorization: 'Bearer ' + authToken() } });
    if (!response.ok) throw new Error('No fue posible descargar la evidencia.');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evidencia-${id}`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) { showToast(error.message, true); }
}

async function removeRow(resource, id) {
  if (!confirm('¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer.')) return;
  try {
    await requestResource(resource, 'DELETE', undefined, id);
    await loadAll();
    renderManagement();
    showToast('Registro eliminado.');
  } catch (error) { showToast(error.message, true); }
}

function showToast(message, error = false) {
  const toast = el('#toast');
  toast.textContent = message;
  toast.classList.toggle('toast-error', error);
  toast.classList.add('toast-visible');
  clearTimeout(viewState.toastTimer);
  viewState.toastTimer = setTimeout(() => toast.classList.remove('toast-visible'), 3500);
}

function exportCsv() {
  const resource = viewState.view;
  const definition = config[resource];
  if (!definition) return;
  const rows = viewState.records[resource] || [];
  const cell = (value) => {
    let text = String(value ?? '');
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = [definition.columns.map(([, title]) => cell(title)).join(','), ...rows.map((row) => definition.columns.map(([field]) => {
    const value = field === 'evidence'
      ? (row.evidence || []).map((file) => file.original_name).join('; ')
      : row[field];
    return cell(value);
  }).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resource}-practicas-2026-2.csv`;
  link.click();
  URL.revokeObjectURL(url);
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
el('#logout-button').addEventListener('click', signOut);
el('#refresh-report').addEventListener('click', () => renderReports().catch((error) => showToast(error.message, true)));
el('#report-csv').addEventListener('click', async (event) => {
  event.preventDefault();
  try {
    const response = await fetch('/api/reports/practices.csv', { headers: { Authorization: 'Bearer ' + authToken() } });
    if (!response.ok) throw new Error('No se pudo generar el CSV.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = 'informe-practicas.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) { showToast(error.message, true); }
});
el('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const submit = event.currentTarget.querySelector('[type="submit"]');
  submit.disabled = true;
  el('#login-error').textContent = '';
  try {
    const result = await api('auth/login', { method: 'POST', body: Object.fromEntries(form.entries()), authenticated: false });
    sessionStorage.setItem('practicas:token', result.token);
    await activateUser(result.user);
  } catch (error) { el('#login-error').textContent = error.message; }
  finally { submit.disabled = false; }
});

async function boot() {
  const dialog = el('#login-dialog');
  if (!authToken()) {
    dialog.showModal();
    return;
  }
  try {
    const user = await api('auth/me');
    await activateUser(user);
  } catch {
    sessionStorage.removeItem('practicas:token');
    if (!dialog.open) dialog.showModal();
  }
}

boot().catch((error) => {
  signOut();
  el('#login-error').textContent = error.message;
});
