import test from 'node:test';
import assert from 'node:assert/strict';
import { weeklyHours } from '../public/js/dashboard.js';

test('weekly chart groups actual activity dates and excludes rejected hours', () => {
  const weeks = weeklyHours([
    { activity_date: '2026-11-16', hours: 4, review_status: 'Pendiente' },
    { activity_date: '2026-11-17', hours: 2, review_status: 'Aprobada' },
    { activity_date: '2026-11-23', hours: 3, review_status: 'Rechazada' },
    { activity_date: '2026-11-24', hours: 5, review_status: 'Aprobada' },
    { activity_date: 'invalid-date', hours: 20, review_status: 'Aprobada' },
    { activity_date: '2026-08-31', hours: 10, review_status: 'Aprobada' }
  ], new Date(2026, 10, 25, 12));

  assert.equal(weeks.length, 12);
  assert.equal(weeks[10].hours, 6);
  assert.equal(weeks[11].hours, 5);
  assert.equal(weeks[11].label, 'S12');
});
