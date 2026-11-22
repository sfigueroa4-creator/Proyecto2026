import { Router } from 'express';
import { resourceRouter } from './resource.routes.js';

export default function createPracticesRouter(recordsService) {
  const router = Router();
  router.get('/summary', async (req, res, next) => {
    try { res.json(await recordsService.dashboardSummary(req.user)); } catch (error) { next(error); }
  });
  router.use('/', resourceRouter('practices', recordsService));
  return router;
}
