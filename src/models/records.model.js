import { pool } from '../config/database.js';

const resources = {
  students: { table: 'students', columns: ['code', 'full_name', 'email', 'semester', 'status'] },
  institutions: { table: 'institutions', columns: ['name', 'city', 'contact_name', 'contact_email', 'agreement_status'] },
  practices: { table: 'practices', columns: ['student_id', 'institution_id', 'advisor_name', 'start_date', 'end_date', 'status'] },
  hours: { table: 'practice_hours', columns: ['practice_id', 'activity_date', 'hours', 'activity', 'evidence_url', 'review_status'] }
};

export function resourceConfig(resource) {
  const config = resources[resource];
  if (!config) throw Object.assign(new Error('Recurso no encontrado.'), { status: 404 });
  return config;
}

export async function listRecords(resource) {
  const { table } = resourceConfig(resource);
  if (resource === 'practices') {
    const [rows] = await pool.query(`SELECT p.*, s.full_name AS student_name, s.code AS student_code, i.name AS institution_name, COALESCE(SUM(h.hours), 0) AS hours_logged FROM practices p JOIN students s ON s.id = p.student_id JOIN institutions i ON i.id = p.institution_id LEFT JOIN practice_hours h ON h.practice_id = p.id GROUP BY p.id ORDER BY p.updated_at DESC`);
    return rows;
  }
  if (resource === 'hours') {
    const [rows] = await pool.query(`SELECT h.*, s.full_name AS student_name FROM practice_hours h JOIN practices p ON p.id = h.practice_id JOIN students s ON s.id = p.student_id ORDER BY h.activity_date DESC, h.id DESC`);
    return rows;
  }
  const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY updated_at DESC, id DESC`);
  return rows;
}

export async function createRecord(resource, input) {
  const { table, columns } = resourceConfig(resource);
  const data = Object.fromEntries(columns.map((column) => [column, input[column] ?? null]));
  const names = Object.keys(data);
  const placeholders = names.map(() => '?').join(', ');
  const [result] = await pool.execute(`INSERT INTO ${table} (${names.join(', ')}) VALUES (${placeholders})`, Object.values(data));
  return result.insertId;
}

export async function updateRecord(resource, id, input) {
  const { table, columns } = resourceConfig(resource);
  const data = Object.fromEntries(columns.filter((column) => Object.hasOwn(input, column)).map((column) => [column, input[column]]));
  if (!Object.keys(data).length) throw Object.assign(new Error('No hay campos válidos para actualizar.'), { status: 400 });
  const assignments = Object.keys(data).map((column) => `${column} = ?`).join(', ');
  const [result] = await pool.execute(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...Object.values(data), id]);
  return result.affectedRows > 0;
}

export async function deleteRecord(resource, id) {
  const { table } = resourceConfig(resource);
  const [result] = await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

export async function dashboardSummary() {
  const [[students]] = await pool.query('SELECT COUNT(*) AS total FROM students WHERE status = \'En práctica\'');
  const [[institutions]] = await pool.query('SELECT COUNT(*) AS total FROM institutions WHERE agreement_status = \'Vigente\'');
  const [[hours]] = await pool.query('SELECT COALESCE(SUM(hours), 0) AS total FROM practice_hours WHERE review_status <> \'Rechazada\'');
  const [[pending]] = await pool.query('SELECT COUNT(*) AS total FROM practice_hours WHERE review_status = \'Pendiente\'');
  const [statuses] = await pool.query('SELECT status, COUNT(*) AS total FROM practices GROUP BY status');
  return { students: students.total, institutions: institutions.total, hours: Number(hours.total), pending: pending.total, statuses };
}
