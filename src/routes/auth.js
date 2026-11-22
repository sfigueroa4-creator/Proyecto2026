import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';

export function createAuthRouter(usersService) {
  const router = Router();
  const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' }
  });

  router.post('/login', loginLimit, async (req, res, next) => {
    try {
      const result = await usersService.authenticateUser(req.body?.email, req.body?.password);
      if (!result) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
      res.json(result);
    } catch (error) { next(error); }
  });

  router.get('/me', requireAuth(usersService), async (req, res, next) => {
    try {
      const user = await usersService.getCurrentUser(req.user.id);
      if (!user) return res.status(401).json({ error: 'La cuenta ya no existe.' });
      res.json(user);
    } catch (error) { next(error); }
  });

  router.post('/logout', requireAuth(usersService), async (req, res, next) => {
    try {
      await usersService.revokeToken(req.user);
      res.status(204).end();
    } catch (error) { next(error); }
  });
  return router;
}
