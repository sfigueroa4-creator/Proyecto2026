import { Router } from 'express';
import path from 'node:path';
import multer from 'multer';
import { allowRoles } from '../middleware/auth.js';

const acceptedTypes = new Map([
  ['application/pdf', '.pdf'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx']
]);

export function createEvidenceRouter(evidenceService) {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const validJpeg = file.mimetype === 'image/jpeg' && ['.jpg', '.jpeg'].includes(extension);
      if (!validJpeg && acceptedTypes.get(file.mimetype) !== extension) {
        return callback(Object.assign(new Error('Tipo de archivo no permitido.'), { status: 415 }));
      }
      callback(null, true);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      res.json(await evidenceService.list(req.query.practice_id, req.user));
    } catch (error) { next(error); }
  });

  router.post('/', allowRoles('admin', 'coordinator', 'student'), upload.single('file'), async (req, res, next) => {
    try {
      const metadata = await evidenceService.upload({
        practiceId: req.body.practice_id,
        hourId: req.body.hour_id,
        file: req.file,
        user: req.user
      });
      res.status(201).json(metadata);
    } catch (error) { next(error); }
  });

  router.get('/:id/download', async (req, res, next) => {
    try {
      const file = await evidenceService.getDownload(req.params.id, req.user);
      if (!file) return res.status(404).json({ error: 'Evidencia no encontrada.' });
      res.download(file.path, file.filename, (error) => {
        if (error) next(error);
      });
    } catch (error) { next(error); }
  });
  return router;
}
