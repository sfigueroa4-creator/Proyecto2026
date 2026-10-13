import { createRecord, deleteRecord, listRecords, updateRecord } from '../models/records.model.js';

export async function list(req, res, next) {
  try { res.json(await listRecords(req.params.resource)); } catch (error) { next(error); }
}

export async function create(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'Envía un objeto JSON.' });
    const id = await createRecord(req.params.resource, req.body);
    res.status(201).json({ id, message: 'Registro creado.' });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const updated = await updateRecord(req.params.resource, Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: 'Registro no encontrado.' });
    res.json({ message: 'Registro actualizado.' });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    const deleted = await deleteRecord(req.params.resource, Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Registro no encontrado.' });
    res.status(204).end();
  } catch (error) { next(error); }
}
