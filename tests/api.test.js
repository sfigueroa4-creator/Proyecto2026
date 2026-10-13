import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const unique = randomUUID().slice(0, 8);

async function call(resource, method = 'GET', body, id) {
  const response = await fetch(`${base}/api/${resource}${id ? `/${id}` : ''}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const data = response.status === 204 ? null : await response.json();
  return { response, data };
}

test('CRUD integral de estudiante, institución, práctica y registro de horas', async (context) => {
  const health = await fetch(`${base}/api/health`).catch(() => null);
  assert.ok(health?.ok, 'Inicia la API y configura MySQL antes de ejecutar npm test.');

  let studentId;
  let institutionId;
  let practiceId;
  let hoursId;
  try {
    let result = await call('students', 'POST', {
      code: `T-${unique}`, full_name: 'Estudiante de pruebas', email: `test-${unique}@example.edu`, semester: 5, status: 'Pendiente'
    });
    assert.equal(result.response.status, 201);
    studentId = result.data.id;
    assert.ok(studentId);

    result = await call('students');
    assert.ok(result.data.some((row) => row.id === studentId), 'GET encuentra el estudiante creado.');

    result = await call('students', 'PUT', { status: 'En práctica' }, studentId);
    assert.equal(result.response.status, 200);
    result = await call('students');
    assert.equal(result.data.find((row) => row.id === studentId).status, 'En práctica');

    result = await call('institutions', 'POST', {
      name: `Institución QA ${unique}`, city: 'Bucaramanga', contact_name: 'Contacto de pruebas', contact_email: `contact-${unique}@example.edu`, agreement_status: 'Vigente'
    });
    assert.equal(result.response.status, 201);
    institutionId = result.data.id;

    result = await call('institutions');
    assert.ok(result.data.some((row) => row.id === institutionId));

    result = await call('institutions', 'PUT', { agreement_status: 'En trámite' }, institutionId);
    assert.equal(result.response.status, 200);

    result = await call('practices', 'POST', {
      student_id: studentId, institution_id: institutionId, advisor_name: 'Docente QA', start_date: '2026-10-01', status: 'En curso'
    });
    assert.equal(result.response.status, 201);
    practiceId = result.data.id;

    result = await call('practices');
    assert.ok(result.data.some((row) => row.id === practiceId && row.student_name === 'Estudiante de pruebas'));

    result = await call('hours', 'POST', {
      practice_id: practiceId, activity_date: '2026-10-02', hours: 4.5, activity: 'Registro de prueba automatizada', review_status: 'Pendiente'
    });
    assert.equal(result.response.status, 201);
    hoursId = result.data.id;

    result = await call('hours');
    assert.ok(result.data.some((row) => row.id === hoursId));

    result = await call('hours', 'PUT', { review_status: 'Aprobada' }, hoursId);
    assert.equal(result.response.status, 200);
    result = await call('hours');
    assert.equal(result.data.find((row) => row.id === hoursId).review_status, 'Aprobada');

    for (const [resource, id] of [['hours', hoursId], ['practices', practiceId], ['institutions', institutionId], ['students', studentId]]) {
      result = await call(resource, 'DELETE', undefined, id);
      assert.equal(result.response.status, 204, `DELETE ${resource} elimina el registro de prueba.`);
    }
    hoursId = practiceId = institutionId = studentId = undefined;
    context.diagnostic('CRUD completado: crear, leer, actualizar y eliminar las cuatro entidades.');
  } finally {
    for (const [resource, id] of [['hours', hoursId], ['practices', practiceId], ['institutions', institutionId], ['students', studentId]]) {
      if (id) await call(resource, 'DELETE', undefined, id).catch(() => {});
    }
  }
});

test('demo Node.js entrega resultados de los cinco módulos nativos', async () => {
  const response = await fetch(`${base}/api/services?demo=1`);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.match(result.uuid, /^[0-9a-f-]{36}$/i);
  assert.ok(result.platform);
  assert.ok(Number.isInteger(result.publicFileCount));
  assert.equal(result.requestedPath, '/api/services');
  assert.equal(result.queryParameters.demo, '1');
});
