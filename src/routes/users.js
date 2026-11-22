import { Router } from 'express';
import { allowRoles } from '../middleware/auth.js';

export function createUsersRouter(usersService) {
  const router = Router();
  router.use(allowRoles('admin'));
  router.get('/', async (_req, res, next) => {
    try { res.json(await usersService.listUsers()); } catch (error) { next(error); }
  });
  router.post('/', async (req, res, next) => {
    try { res.status(201).json(await usersService.createUser(req.body || {})); } catch (error) { next(error); }
  });
  return router;
}
