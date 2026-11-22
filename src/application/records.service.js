import { assertMethods } from './ports.js';
import { domainError, isManager, numericId, resourceConfig, role, validateInput } from '../domain/records.js';

const publicRecord = ({ _id, ...record }) => ({ ...record, id: _id });
const publicEvidence = ({ _id, storage_name, ...file }) => ({
  ...file,
  id: _id,
  download_url: `/api/evidence/${_id}/download`
});

export function createRecordsService({ repository, evidenceStorage, clock = () => new Date() }) {
  assertMethods('RecordsRepository', repository, ['get', 'list', 'find', 'findMany', 'nextId', 'insert', 'update', 'delete', 'deleteMany']);
  assertMethods('EvidenceStorage', evidenceStorage, ['remove']);

  async function practiceAccess(practice, user) {
    if (!practice || !user) return false;
    if (isManager(user) || role(user) === 'director') return true;
    if (role(user) === 'advisor') return practice.advisor_user_id === user.id;
    if (role(user) === 'student') {
      const student = await repository.get('students', practice.student_id);
      return student?.user_id === user.id || student?._id === user.profile_id;
    }
    if (role(user) === 'institution') {
      const institution = await repository.get('institutions', practice.institution_id);
      return institution?.user_id === user.id || institution?._id === user.profile_id;
    }
    return false;
  }

  async function assertPracticeAccess(practiceId, user) {
    const practice = await repository.get('practices', practiceId);
    if (!await practiceAccess(practice, user)) throw domainError('No tienes acceso a esta práctica.', 403);
    return practice;
  }

  async function canAccessRecord(resource, record, user) {
    if (isManager(user) || role(user) === 'director') return true;
    if (['practices', 'hours', 'visits', 'validations'].includes(resource)) {
      const practice = resource === 'practices' ? record : await repository.get('practices', record.practice_id);
      return practiceAccess(practice, user);
    }
    if (resource === 'students' && role(user) === 'student') {
      return record.user_id === user.id || record._id === user.profile_id;
    }
    if (resource === 'institutions' && role(user) === 'institution') {
      return record.user_id === user.id || record._id === user.profile_id;
    }
    if (resource === 'institutions' && role(user) === 'advisor') {
      return Boolean(await repository.find('practices', { institution_id: record._id, advisor_user_id: user.id }));
    }
    if (resource === 'students' && role(user) === 'advisor') {
      return Boolean(await repository.find('practices', { student_id: record._id, advisor_user_id: user.id }));
    }
    return false;
  }

  async function enrichPractice(practice) {
    const [student, institution, hours, evidence] = await Promise.all([
      repository.get('students', practice.student_id),
      repository.get('institutions', practice.institution_id),
      repository.findMany('hours', { practice_id: practice._id }),
      repository.findMany('evidence', { practice_id: practice._id })
    ]);
    return {
      ...publicRecord(practice),
      student_name: student?.full_name || '',
      student_code: student?.code || '',
      institution_name: institution?.name || '',
      hours_logged: hours.filter((item) => item.review_status !== 'Rechazada').reduce((sum, item) => sum + Number(item.hours), 0),
      evidence: evidence.map(publicEvidence)
    };
  }

  async function listRecords(resource, user) {
    resourceConfig(resource);
    const records = await repository.list(resource);
    const accessible = [];
    for (const record of records) {
      if (await canAccessRecord(resource, record, user)) accessible.push(record);
    }
    if (resource === 'practices') return Promise.all(accessible.map(enrichPractice));
    if (resource === 'hours') {
      return Promise.all(accessible.map(async (record) => {
        const practice = await repository.get('practices', record.practice_id);
        const student = practice ? await repository.get('students', practice.student_id) : null;
        const evidence = await repository.findMany('evidence', { hour_id: record._id });
        return { ...publicRecord(record), student_name: student?.full_name || '', evidence: evidence.map(publicEvidence) };
      }));
    }
    if (resource === 'visits' || resource === 'validations') {
      return Promise.all(accessible.map(async (record) => {
        const practice = await repository.get('practices', record.practice_id);
        const student = practice ? await repository.get('students', practice.student_id) : null;
        return { ...publicRecord(record), student_name: student?.full_name || '' };
      }));
    }
    return accessible.map(publicRecord);
  }

  async function validateReferences(resource, input) {
    if (resource === 'practices') {
      if (input.student_id !== undefined && !await repository.get('students', input.student_id)) throw domainError('Estudiante no encontrado.');
      if (input.institution_id !== undefined && !await repository.get('institutions', input.institution_id)) throw domainError('Institución no encontrada.');
      if (input.advisor_user_id !== undefined && !await repository.find('users', { _id: Number(input.advisor_user_id), role: 'advisor' })) {
        throw domainError('El usuario asesor no existe o no tiene el rol requerido.');
      }
    }
    if (['hours', 'visits', 'validations'].includes(resource) && input.practice_id !== undefined && !await repository.get('practices', input.practice_id)) {
      throw domainError('Práctica no encontrada.');
    }
  }

  async function createRecord(resource, input, user) {
    const data = validateInput(resource, input);
    Object.assign(data, Object.fromEntries(Object.entries(resourceConfig(resource).defaults || {}).filter(([field]) => data[field] === undefined)));
    await validateReferences(resource, data);
    if (['hours', 'visits', 'validations'].includes(resource)) await assertPracticeAccess(data.practice_id, user);
    if (resource === 'hours' && role(user) === 'student' && data.review_status && data.review_status !== 'Pendiente') {
      throw domainError('Los registros creados por estudiantes deben quedar pendientes de revisión.', 403);
    }
    if (resource === 'hours' && role(user) === 'student') data.review_status = 'Pendiente';
    if (resource === 'visits' && role(user) === 'advisor') data.observer_name = user.full_name;
    if (resource === 'validations' && role(user) === 'institution') {
      data.validated_by = user.id;
      data.validated_at = clock();
    }
    const id = await repository.nextId(resource);
    const now = clock();
    await repository.insert(resource, { _id: id, ...data, created_at: now, updated_at: now });
    return id;
  }

  async function updateRecord(resource, id, input, user) {
    if (!numericId(id)) throw domainError('Identificador no válido.');
    const data = validateInput(resource, input, true);
    if (!Object.keys(data).length) throw domainError('No hay campos válidos para actualizar.');
    const current = await repository.get(resource, id);
    if (!current) return false;
    if (!await canAccessRecord(resource, current, user)) throw domainError('No tienes acceso a este registro.', 403);
    if (resource === 'hours' && !isManager(user) && role(user) !== 'advisor') throw domainError('No tienes permiso para modificar horas.', 403);
    if (resource === 'hours' && role(user) === 'advisor' && Object.keys(data).some((key) => key !== 'review_status')) {
      throw domainError('El asesor solo puede actualizar el estado de revisión.', 403);
    }
    const fields = resourceConfig(resource).fields;
    const merged = Object.fromEntries(fields
      .filter((field) => data[field] !== undefined || current[field] !== undefined)
      .map((field) => [field, data[field] ?? current[field]]));
    validateInput(resource, merged);
    await validateReferences(resource, data);
    if (['hours', 'visits', 'validations'].includes(resource)) {
      const targetPracticeId = data.practice_id ?? current.practice_id;
      await assertPracticeAccess(targetPracticeId, user);
    }
    return repository.update(resource, id, { ...data, updated_at: clock() });
  }

  async function deletePracticeChildren(practiceIds) {
    if (!practiceIds.length) return;
    const files = await repository.findMany('evidence', { practice_id: practiceIds });
    for (const file of files) await evidenceStorage.remove(file.storage_name);
    await Promise.all(['hours', 'visits', 'validations', 'evidence'].map((name) =>
      repository.deleteMany(name, { practice_id: practiceIds })
    ));
  }

  async function deleteHourEvidence(hourId) {
    const files = await repository.findMany('evidence', { hour_id: Number(hourId) });
    for (const file of files) await evidenceStorage.remove(file.storage_name);
    await repository.deleteMany('evidence', { hour_id: Number(hourId) });
  }

  async function deleteRecord(resource, id, user) {
    if (!numericId(id)) throw domainError('Identificador no válido.');
    const current = await repository.get(resource, id);
    if (!current) return false;
    if (!isManager(user)) throw domainError('No tienes permiso para eliminar registros.', 403);
    if (resource === 'institutions' && await repository.find('practices', { institution_id: Number(id) })) {
      throw domainError('No se puede eliminar una institución con prácticas vinculadas.', 409);
    }
    if (resource === 'students') {
      const practices = await repository.findMany('practices', { student_id: Number(id) });
      const practiceIds = practices.map((practice) => practice._id);
      await deletePracticeChildren(practiceIds);
      await repository.deleteMany('practices', { student_id: Number(id) });
    }
    if (resource === 'practices') await deletePracticeChildren([Number(id)]);
    if (resource === 'hours') await deleteHourEvidence(id);
    return repository.delete(resource, id);
  }

  async function dashboardSummary(user) {
    const [students, institutions, practices, hours] = await Promise.all([
      listRecords('students', user),
      listRecords('institutions', user),
      listRecords('practices', user),
      listRecords('hours', user)
    ]);
    const statuses = Object.entries(practices.reduce((counts, practice) => {
      counts[practice.status] = (counts[practice.status] || 0) + 1;
      return counts;
    }, {})).map(([status, total]) => ({ status, total }));
    return {
      students: students.filter((student) => student.status === 'En práctica').length,
      institutions: institutions.filter((institution) => institution.agreement_status === 'Vigente').length,
      hours: hours.filter((item) => item.review_status !== 'Rechazada').reduce((sum, item) => sum + Number(item.hours), 0),
      pending: hours.filter((item) => item.review_status === 'Pendiente').length,
      statuses
    };
  }

  async function generateReports(user) {
    const [practices, hours, visits, validations] = await Promise.all([
      listRecords('practices', user),
      listRecords('hours', user),
      listRecords('visits', user),
      listRecords('validations', user)
    ]);
    return {
      generated_at: clock().toISOString(),
      totals: {
        practices: practices.length,
        hours_reported: hours.reduce((sum, item) => sum + Number(item.hours), 0),
        hours_approved: hours.filter((item) => item.review_status === 'Aprobada').reduce((sum, item) => sum + Number(item.hours), 0),
        pending_hours: hours.filter((item) => item.review_status === 'Pendiente').length,
        visits: visits.length,
        pending_validations: validations.filter((item) => item.attendance_status === 'Pendiente' || item.performance_status === 'Pendiente').length
      },
      practices
    };
  }

  return { listRecords, createRecord, updateRecord, deleteRecord, dashboardSummary, generateReports, assertPracticeAccess };
}
