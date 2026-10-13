import { Router } from 'express';
import { dashboardSummary } from '../models/records.model.js';
import { resourceRouter } from './resource.routes.js';
const router = Router();
router.get('/summary', async (_req, res, next) => { try { res.json(await dashboardSummary()); } catch (error) { next(error); } });
router.use('/', resourceRouter('practices'));
export default router;
