import test from 'node:test';
import assert from 'node:assert/strict';
import { resourceConfig, validateInput, roleNames } from '../src/domain/records.js';

test('modelos declaran los seis recursos funcionales con los campos de dominio', () => {
  for (const resource of ['students', 'institutions', 'practices', 'hours', 'visits', 'validations']) {
    assert.ok(resourceConfig(resource).fields.length > 0);
  }
  assert.ok(resourceConfig('visits').fields.includes('evaluation'));
  assert.ok(resourceConfig('validations').fields.includes('attendance_status'));
});

test('validador rechaza campos no permitidos, estados inválidos y horas fuera de rango', () => {
  assert.throws(() => validateInput('students', { code: 'A', full_name: 'Nombre', email: 'a@example.edu', is_admin: true }), /no permitidos/);
  assert.throws(() => validateInput('students', { code: 'A', full_name: 'Nombre', email: 'a@example.edu', status: 'Desconocido' }), /no es válido/);
  assert.equal(validateInput('hours', { practice_id: 1, activity_date: '2026-11-01', hours: 4.5, activity: 'Prueba' }).hours, 4.5);
  assert.throws(() => validateInput('hours', { practice_id: 1, activity_date: '2026-11-01', hours: 25, activity: 'Prueba' }), /no superar 24/);
  assert.throws(() => validateInput('hours', { practice_id: '0', activity_date: '2026-11-01', hours: 1, activity: 'Prueba' }), /entero positivo/);
});

test('contratos de visitas y validaciones exigen los campos de cierre', () => {
  assert.throws(() => validateInput('visits', { practice_id: 1, visit_date: '2026-11-01' }), /observer_name/);
  assert.throws(() => validateInput('validations', { practice_id: 1, attendance_status: 'Aceptada', performance_status: 'Satisfactoria' }), /attendance_status/);
  assert.deepEqual(roleNames, ['admin', 'coordinator', 'student', 'advisor', 'institution', 'director']);
});
