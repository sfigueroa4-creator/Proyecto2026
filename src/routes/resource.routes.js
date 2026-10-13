import { Router } from 'express';
import { create, list, remove, update } from '../controllers/records.controller.js';

export function resourceRouter(resource) {
  const router = Router();
  router.get('/', (req, res, next) => { req.params.resource = resource; return list(req, res, next); });
  router.post('/', (req, res, next) => { req.params.resource = resource; return create(req, res, next); });
  router.put('/:id', (req, res, next) => { req.params.resource = resource; return update(req, res, next); });
  router.delete('/:id', (req, res, next) => { req.params.resource = resource; return remove(req, res, next); });
  return router;
}
