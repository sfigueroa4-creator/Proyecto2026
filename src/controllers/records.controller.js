export function createRecordsController(recordsService) {
  return {
    async list(req, res, next) {
      try { res.json(await recordsService.listRecords(req.params.resource, req.user)); } catch (error) { next(error); }
    },
    async create(req, res, next) {
      try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'Envía un objeto JSON.' });
        const id = await recordsService.createRecord(req.params.resource, req.body, req.user);
        res.status(201).json({ id, message: 'Registro creado.' });
      } catch (error) { next(error); }
    },
    async update(req, res, next) {
      try {
        const updated = await recordsService.updateRecord(req.params.resource, Number(req.params.id), req.body, req.user);
        if (!updated) return res.status(404).json({ error: 'Registro no encontrado.' });
        res.json({ message: 'Registro actualizado.' });
      } catch (error) { next(error); }
    },
    async remove(req, res, next) {
      try {
        const deleted = await recordsService.deleteRecord(req.params.resource, Number(req.params.id), req.user);
        if (!deleted) return res.status(404).json({ error: 'Registro no encontrado.' });
        res.status(204).end();
      } catch (error) { next(error); }
    }
  };
}
