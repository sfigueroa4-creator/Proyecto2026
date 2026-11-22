import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const email = process.env.TEST_ADMIN_EMAIL || process.env.BOOTSTRAP_ADMIN_EMAIL;
const password = process.env.TEST_ADMIN_PASSWORD || process.env.BOOTSTRAP_ADMIN_PASSWORD;
const integrationConfigured = Boolean(email && password);
const customBaseUrl = Boolean(process.env.TEST_BASE_URL);
const unique = randomUUID().slice(0, 8);
let token;

async function apiIsAvailable(context) {
  if (!integrationConfigured) {
    context.skip('Configura credenciales de prueba para la integración API.');
    return false;
  }
  try {
    const response = await fetch(`${base}/api/health`);
    if (!response.ok) throw new Error(`El servidor API respondió HTTP ${response.status}.`);
    return true;
  } catch (error) {
    if (customBaseUrl) throw error;
    context.skip('Inicia MongoDB y el servidor API para ejecutar pruebas de integración.');
    return false;
  }
}

async function login() {
  const response = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  assert.equal(response.status, 200, 'Configura un administrador y MongoDB antes de ejecutar pruebas de integración.');
  token = (await response.json()).token;
}

async function call(resource, method = 'GET', body, id) {
  const response = await fetch(`${base}/api/${resource}${id ? `/${id}` : ''}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const contentType = response.headers.get('content-type') || '';
  const data = response.status === 204 ? null
    : contentType.includes('application/json') ? await response.json()
      : await response.text();
  return { response, data };
}

test('API protege los recursos y completa CRUD, visitas, validaciones e informes en MongoDB', async (context) => {
  if (!await apiIsAvailable(context)) return;
  const publicHealth = await fetch(`${base}/api/health`);
  assert.equal(publicHealth.status, 200);
  const health = await publicHealth.json();
  assert.equal(health.database, 'MongoDB');

  const anonymous = await fetch(`${base}/api/students`);
  assert.equal(anonymous.status, 401);
  await login();

  let studentId;
  let institutionId;
  let practiceId;
  let hoursId;
  let visitId;
  let validationId;
  try {
    let result = await call('students', 'POST', {
      code: `T-${unique}`, full_name: 'Estudiante de pruebas', email: `test-${unique}@example.edu`, semester: 5, status: 'Pendiente'
    });
    assert.equal(result.response.status, 201);
    studentId = result.data.id;
    result = await call('students');
    assert.ok(result.data.some((row) => row.id === studentId));
    result = await call('students', 'PUT', { status: 'En práctica' }, studentId);
    assert.equal(result.response.status, 200);

    result = await call('institutions', 'POST', {
      name: `Institución QA ${unique}`, city: 'Bucaramanga', contact_name: 'Contacto QA',
      contact_email: `contact-${unique}@example.edu`, agreement_status: 'Vigente'
    });
    assert.equal(result.response.status, 201);
    institutionId = result.data.id;

    result = await call('practices', 'POST', {
      student_id: studentId, institution_id: institutionId, advisor_name: 'Docente QA',
      start_date: '2026-11-01', status: 'En curso'
    });
    assert.equal(result.response.status, 201);
    practiceId = result.data.id;
    result = await call('practices');
    assert.ok(result.data.some((row) => row.id === practiceId && row.student_name === 'Estudiante de pruebas'));

    result = await call('hours', 'POST', {
      practice_id: practiceId, activity_date: '2026-11-02', hours: 4.5,
      activity: 'Registro de prueba automatizada', review_status: 'Pendiente'
    });
    assert.equal(result.response.status, 201);
    hoursId = result.data.id;
    result = await call('hours', 'PUT', { review_status: 'Aprobada' }, hoursId);
    assert.equal(result.response.status, 200);

    const upload = new FormData();
    upload.append('practice_id', String(practiceId));
    upload.append('hour_id', String(hoursId));
    upload.append('file', new Blob(['%PDF-1.4 integration evidence'], { type: 'application/pdf' }), `evidence-${unique}.pdf`);
    let evidenceResponse = await fetch(`${base}/api/evidence`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: upload
    });
    assert.equal(evidenceResponse.status, 201);
    const evidence = await evidenceResponse.json();
    evidenceResponse = await fetch(`${base}${evidence.download_url}`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    assert.equal(evidenceResponse.status, 200);
    assert.match(evidenceResponse.headers.get('content-type'), /application\/pdf/);

    result = await call('visits', 'POST', {
      practice_id: practiceId, visit_date: '2026-11-03', observer_name: 'Asesor QA',
      evaluation: 'Satisfactoria', observations: 'Visita de integración.'
    });
    assert.equal(result.response.status, 201);
    visitId = result.data.id;

    result = await call('validations', 'POST', {
      practice_id: practiceId, attendance_status: 'Validada',
      performance_status: 'Satisfactoria', observations: 'Validación de prueba.'
    });
    assert.equal(result.response.status, 201);
    validationId = result.data.id;

    result = await call('reports');
    assert.equal(result.response.status, 200);
    assert.ok(result.data.totals.hours_approved >= 4.5);
    assert.ok(result.data.totals.visits >= 1);
    result = await call('reports/practices.csv');
    assert.equal(result.response.status, 200);
    assert.match(result.response.headers.get('content-type'), /text\/csv/);

    result = await call('hours', 'DELETE', undefined, hoursId);
    assert.equal(result.response.status, 204);
    hoursId = undefined;
    result = await call(`evidence?practice_id=${practiceId}`);
    assert.equal(result.response.status, 200);
    assert.equal(result.data.length, 0, 'Eliminar un registro de horas también elimina sus evidencias.');

    for (const [resource, id] of [
      ['validations', validationId], ['visits', visitId],
      ['practices', practiceId], ['institutions', institutionId], ['students', studentId]
    ]) {
      result = await call(resource, 'DELETE', undefined, id);
      assert.equal(result.response.status, 204, `DELETE ${resource} elimina el registro de prueba.`);
    }
    validationId = visitId = hoursId = practiceId = institutionId = studentId = undefined;
    context.diagnostic('MongoDB CRUD, autorización, visitas, validaciones e informes completados.');
    result = await call('auth/logout', 'POST');
    assert.equal(result.response.status, 204);
    result = await call('students');
    assert.equal(result.response.status, 401, 'El token revocado deja de autorizar solicitudes.');
  } finally {
    for (const [resource, id] of [
      ['validations', validationId], ['visits', visitId], ['hours', hoursId],
      ['practices', practiceId], ['institutions', institutionId], ['students', studentId]
    ]) {
      if (id) await call(resource, 'DELETE', undefined, id).catch(() => {});
    }
  }
});

test('API de autenticación rechaza credenciales inválidas', async (context) => {
  if (!await apiIsAvailable(context)) return;
  const response = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'contraseña-incorrecta' })
  });
  assert.equal(response.status, 401);
});
