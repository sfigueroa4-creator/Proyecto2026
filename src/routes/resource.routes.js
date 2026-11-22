import { Router } from 'express';
import { createRecordsController } from '../controllers/records.controller.js';
import { allowRoles } from '../middleware/auth.js';

const managers = ['admin', 'coordinator'];
const permissions = {
  students: { create: managers, update: managers, delete: managers },
  institutions: { create: managers, update: managers, delete: managers },
  practices: { create: managers, update: managers, delete: managers },
  hours: { create: [...managers, 'student'], update: [...managers, 'advisor'], delete: managers },
  visits: { create: [...managers, 'advisor'], update: [...managers, 'advisor'], delete: managers },
  validations: { create: [...managers, 'institution'], update: [...managers, 'institution'], delete: managers }
};

export function resourceRouter(resource, recordsService) {
  const router = Router();
  const controller = createRecordsController(recordsService);
  const allowed = permissions[resource];
  router.get('/', (req, res, next) => { req.params.resource = resource; return controller.list(req, res, next); });
  router.post('/', allowRoles(...allowed.create), (req, res, next) => { req.params.resource = resource; return controller.create(req, res, next); });
  router.put('/:id', allowRoles(...allowed.update), (req, res, next) => { req.params.resource = resource; return controller.update(req, res, next); });
  router.delete('/:id', allowRoles(...allowed.delete), (req, res, next) => { req.params.resource = resource; return controller.remove(req, res, next); });
  return router;
}
