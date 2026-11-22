import { assertMethods } from './ports.js';
import { numericId } from '../domain/records.js';

const publicEvidence = ({ _id, storage_name, ...file }) => ({
  ...file,
  id: _id,
  download_url: `/api/evidence/${_id}/download`
});
const evidenceError = (message, status = 400) => Object.assign(new Error(message), { status });

export function createEvidenceService({ repository, recordsService, storage, clock = () => new Date() }) {
  assertMethods('RecordsRepository', repository, ['get', 'findMany', 'nextId', 'insert']);
  assertMethods('EvidenceStorage', storage, ['save', 'remove', 'pathFor']);

  async function list(practiceId, user) {
    if (!numericId(practiceId)) throw evidenceError('Indica un practice_id válido.');
    await recordsService.assertPracticeAccess(practiceId, user);
    const files = await repository.findMany('evidence', { practice_id: Number(practiceId) });
    files.sort((left, right) => right.created_at - left.created_at);
    return files.map(publicEvidence);
  }

  async function upload({ practiceId, hourId, file, user }) {
    const numericPracticeId = Number(practiceId);
    if (!numericId(numericPracticeId)) throw evidenceError('Indica un practice_id válido.');
    if (!file) throw evidenceError('Selecciona un archivo.');
    await recordsService.assertPracticeAccess(numericPracticeId, user);
    const numericHourId = hourId ? Number(hourId) : null;
    if (numericHourId) {
      const hour = await repository.get('hours', numericHourId);
      if (!hour || hour.practice_id !== numericPracticeId) throw evidenceError('El registro de horas no pertenece a esta práctica.');
    }

    const storageName = await storage.save(file);
    try {
      const metadata = {
        _id: await repository.nextId('evidence'),
        practice_id: numericPracticeId,
        hour_id: numericHourId,
        original_name: String(file.originalname || 'evidencia').split(/[\\/]/).pop().slice(0, 180),
        storage_name: storageName,
        mime_type: file.mimetype,
        size: file.size,
        uploaded_by: user.id,
        created_at: clock()
      };
      await repository.insert('evidence', metadata);
      return publicEvidence(metadata);
    } catch (error) {
      try {
        await storage.remove(storageName);
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], 'No se pudo guardar la evidencia ni limpiar el archivo.');
      }
      throw error;
    }
  }

  async function getDownload(id, user) {
    if (!numericId(id)) return null;
    const file = await repository.get('evidence', Number(id));
    if (!file) return null;
    await recordsService.assertPracticeAccess(file.practice_id, user);
    return { path: storage.pathFor(file.storage_name), filename: file.original_name };
  }

  return { list, upload, getDownload };
}
