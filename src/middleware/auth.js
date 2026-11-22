export function requireAuth(usersService) {
  return async (req, res, next) => {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
    try {
      req.user = await usersService.resolveToken(match[1]);
      req.token = match[1];
      if (!req.user) return res.status(401).json({ error: 'La sesión ya no es válida.' });
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
        return res.status(401).json({ error: 'La sesión expiró o no es válida.' });
      }
      next(error);
    }
  };
}

export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta operación.' });
    }
    next();
  };
}
