import { Router } from 'express';
import { allowRoles } from '../middleware/auth.js';

export function createReportsRouter(recordsService) {
  const router = Router();
  router.use(allowRoles('admin', 'coordinator', 'director'));
  router.get('/', async (req, res, next) => {
    try { res.json(await recordsService.generateReports(req.user)); } catch (error) { next(error); }
  });
  router.get('/practices.csv', async (req, res, next) => {
    try {
      const report = await recordsService.generateReports(req.user);
      const columns = ['id', 'student_name', 'student_code', 'institution_name', 'advisor_name', 'start_date', 'end_date', 'hours_logged', 'status'];
      const escape = (value) => {
        let text = String(value ?? '');
        if (/^[=+\-@]/.test(text)) text = `'${text}`;
        return `"${text.replaceAll('"', '""')}"`;
      };
      const lines = [columns.map(escape).join(','), ...report.practices.map((row) => columns.map((key) => escape(row[key])).join(','))];
      res.type('text/csv').attachment('informe-practicas.csv').send(`\uFEFF${lines.join('\r\n')}`);
    } catch (error) { next(error); }
  });
  return router;
}
