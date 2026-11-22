import { Router } from 'express';
import createStudentsRouter from './students.js';
import createInstitutionsRouter from './institutions.js';
import createPracticesRouter from './practices.js';
import createHoursRouter from './hours.js';
import services from './services.js';
import createVisitsRouter from './visits.js';
import createValidationsRouter from './validations.js';
import { createAuthRouter } from './auth.js';
import { createUsersRouter } from './users.js';
import { createEvidenceRouter } from './evidence.js';
import { createReportsRouter } from './reports.js';
import { requireAuth } from '../middleware/auth.js';

export function createApiRouter(applicationServices) {
  const router = Router();
  const { records, users, evidence } = applicationServices;
  router.use('/auth', createAuthRouter(users));
  router.use(requireAuth(users));
  router.use('/students', createStudentsRouter(records));
  router.use('/institutions', createInstitutionsRouter(records));
  router.use('/practices', createPracticesRouter(records));
  router.use('/hours', createHoursRouter(records));
  router.use('/visits', createVisitsRouter(records));
  router.use('/validations', createValidationsRouter(records));
  router.use('/users', createUsersRouter(users));
  router.use('/evidence', createEvidenceRouter(evidence));
  router.use('/reports', createReportsRouter(records));
  router.use('/services', services);
  return router;
}
