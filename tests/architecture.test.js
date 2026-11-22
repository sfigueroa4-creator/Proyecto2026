import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecordsService } from '../src/application/records.service.js';
import { createUsersService } from '../src/application/users.service.js';
import { createEvidenceService } from '../src/application/evidence.service.js';

function memoryRecordsRepository() {
  const records = new Map();
  const counters = new Map();
  const key = (resource) => {
    if (!records.has(resource)) records.set(resource, []);
    return records.get(resource);
  };
  const matches = (record, criteria) => Object.entries(criteria).every(([field, value]) =>
    Array.isArray(value) ? value.includes(record[field]) : record[field] === value
  );
  return {
    async get(resource, id) { return key(resource).find((record) => record._id === Number(id)) || null; },
    async list(resource) { return key(resource).slice(); },
    async find(resource, criteria) { return key(resource).find((record) => matches(record, criteria)) || null; },
    async findMany(resource, criteria) { return key(resource).filter((record) => matches(record, criteria)); },
    async nextId(resource) {
      const id = (counters.get(resource) || 0) + 1;
      counters.set(resource, id);
      return id;
    },
    async insert(resource, record) { key(resource).push(record); },
    async update(resource, id, patch) {
      const record = await this.get(resource, id);
      if (!record) return false;
      Object.assign(record, patch);
      return true;
    },
    async delete(resource, id) {
      const index = key(resource).findIndex((record) => record._id === Number(id));
      if (index < 0) return false;
      key(resource).splice(index, 1);
      return true;
    },
    async deleteMany(resource, criteria) {
      const before = key(resource).length;
      records.set(resource, key(resource).filter((record) => !matches(record, criteria)));
      return before - key(resource).length;
    }
  };
}

test('records application service executes use cases against an injected repository', async () => {
  const repository = memoryRecordsRepository();
  const records = createRecordsService({
    repository,
    evidenceStorage: { async remove() {} },
    clock: () => new Date('2026-11-22T00:00:00.000Z')
  });
  const studentId = await records.createRecord('students', {
    code: 'S-100', full_name: 'Estudiante Demo', email: 'demo@example.edu'
  }, { id: 1, role: 'admin' });
  const listed = await records.listRecords('students', { id: 1, role: 'admin' });
  assert.equal(studentId, 1);
  assert.equal(listed[0].id, studentId);
  assert.equal(listed[0].full_name, 'Estudiante Demo');
});

test('users application service depends on password and token ports, not database libraries', async () => {
  const users = [];
  const revoked = new Set();
  const repository = {
    async findByEmail(email) { return users.find((user) => user.email === email) || null; },
    async findById(id) { return users.find((user) => user._id === id) || null; },
    async findByProfile(role, profileId) { return users.find((user) => user.role === role && user.profile_id === profileId) || null; },
    async list() { return users.map(({ password_hash, ...user }) => ({ ...user, id: user._id })); },
    async insert(user) {
      const record = { _id: users.length + 1, ...user };
      users.push(record);
      return record;
    },
    async isTokenRevoked(id) { return revoked.has(id); },
    async revokeToken(id) { revoked.add(id); }
  };
  const passwordHasher = {
    async hash(password) { return `hashed:${password}`; },
    async compare(password, hash) { return hash === `hashed:${password}`; }
  };
  const tokenService = {
    issue() { return 'token'; },
    verify() { return { sub: '1', jti: 'token-id', exp: 1795305600 }; }
  };
  const profiles = new Map([['students:3', { _id: 3 }]]);
  const service = createUsersService({
    repository,
    profileRepository: {
      async get(resource, id) { return profiles.get(`${resource}:${id}`) || null; }
    },
    passwordHasher,
    tokenService
  });
  const user = await service.createUser({
    email: ' ADMIN@example.edu ', full_name: 'Admin Demo', password: 'a-long-test-password', role: 'admin'
  });
  const login = await service.authenticateUser('admin@example.edu', 'a-long-test-password');
  const session = await service.resolveToken(login.token);
  assert.equal(user.email, 'admin@example.edu');
  assert.equal(login.token, 'token');
  assert.equal(session.id, 1);
  await service.revokeToken(session);
  assert.equal(await service.resolveToken(login.token), null);
  await assert.rejects(
    service.createUser({ email: 'student@example.edu', full_name: 'Student', password: 'a-long-test-password', role: 'student' }),
    /requiere vincular/
  );
  await assert.rejects(
    service.createUser({ email: 'student@example.edu', full_name: 'Student', password: 'a-long-test-password', role: 'student', profile_id: 99 }),
    /no existe/
  );
  const student = await service.createUser({
    email: 'student@example.edu', full_name: 'Student Demo', password: 'a-long-test-password', role: 'student', profile_id: 3
  });
  assert.equal(student.profile_id, 3);
  await assert.rejects(
    service.createUser({ email: 'student-copy@example.edu', full_name: 'Student Copy', password: 'a-long-test-password', role: 'student', profile_id: 3 }),
    /ya está vinculado/
  );
});

test('evidence use case authorizes before storing and hides internal storage names', async () => {
  const repository = memoryRecordsRepository();
  const stored = [];
  const recordsService = {
    async assertPracticeAccess(practiceId, user) {
      if (practiceId !== 7 || user.role !== 'student') throw Object.assign(new Error('Forbidden'), { status: 403 });
      return { _id: practiceId };
    }
  };
  const storage = {
    async save(file) { stored.push(file); return 'private-random.pdf'; },
    async remove() {},
    pathFor(name) { return `private/${name}`; }
  };
  const evidence = createEvidenceService({ repository, recordsService, storage });
  const result = await evidence.upload({
    practiceId: 7,
    file: { buffer: Buffer.from('fake'), mimetype: 'application/pdf', originalname: 'evidence.pdf', size: 4 },
    user: { id: 2, role: 'student' }
  });

  test('record updates preserve date constraints and deleting hours removes their evidence', async () => {
    const repository = memoryRecordsRepository();
    const removedFiles = [];
    const records = createRecordsService({
      repository,
      evidenceStorage: { async remove(name) { removedFiles.push(name); } },
      clock: () => new Date('2026-11-22T00:00:00.000Z')
    });
    const admin = { id: 1, role: 'admin' };
    const studentId = await records.createRecord('students', {
      code: 'S-DATE', full_name: 'Estudiante Demo', email: 'date@example.edu'
    }, admin);
    const institutionId = await records.createRecord('institutions', {
      name: 'Institución Demo', city: 'Bogotá', contact_name: 'Contacto', contact_email: 'institution@example.edu'
    }, admin);
    const practiceId = await records.createRecord('practices', {
      student_id: studentId, institution_id: institutionId, advisor_name: 'Asesor/a',
      start_date: '2026-11-10', end_date: '2026-11-20'
    }, admin);
    await assert.rejects(
      records.updateRecord('practices', practiceId, { start_date: '2026-11-25' }, admin),
      /no puede ser anterior/
    );

    const hourId = await records.createRecord('hours', {
      practice_id: practiceId, activity_date: '2026-11-12', hours: 2, activity: 'Actividad de prueba'
    }, admin);
    await repository.insert('evidence', {
      _id: 1, practice_id: practiceId, hour_id: hourId, storage_name: 'private-test.pdf'
    });
    assert.equal(await records.deleteRecord('hours', hourId, admin), true);
    assert.deepEqual(removedFiles, ['private-test.pdf']);
    assert.deepEqual(await repository.findMany('evidence', { hour_id: hourId }), []);
  });
  assert.equal(stored.length, 1);
  assert.equal(result.download_url, '/api/evidence/1/download');
  assert.equal(Object.hasOwn(result, 'storage_name'), false);
  assert.deepEqual(await evidence.getDownload(1, { id: 2, role: 'student' }), {
    path: 'private/private-random.pdf',
    filename: 'evidence.pdf'
  });
});
