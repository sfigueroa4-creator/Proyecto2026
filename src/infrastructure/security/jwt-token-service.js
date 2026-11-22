import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('Configura JWT_SECRET con al menos 32 caracteres aleatorios.');
  return value;
};

export const tokenService = {
  issue(userId) {
    return jwt.sign({ sub: String(userId) }, secret(), {
      jwtid: randomUUID(),
      expiresIn: '8h',
      issuer: 'gestor-practicas'
    });
  },
  verify(token) {
    return jwt.verify(token, secret(), { issuer: 'gestor-practicas' });
  }
};
