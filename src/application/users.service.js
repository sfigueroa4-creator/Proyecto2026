import { assertMethods } from './ports.js';
import { roleNames } from '../domain/records.js';

const publicUser = ({ _id, password_hash, ...user }) => ({ ...user, id: _id });
const userError = (message) => Object.assign(new Error(message), { status: 400 });

export function createUsersService({ repository, profileRepository, passwordHasher, tokenService, clock = () => new Date() }) {
  assertMethods('UsersRepository', repository, ['findByEmail', 'findById', 'findByProfile', 'list', 'insert', 'isTokenRevoked', 'revokeToken']);
  assertMethods('ProfileRepository', profileRepository, ['get']);
  assertMethods('PasswordHasher', passwordHasher, ['hash', 'compare']);
  assertMethods('TokenService', tokenService, ['issue', 'verify']);

  async function createUser(input) {
    const email = String(input.email || '').trim().toLowerCase();
    const fullName = String(input.full_name || '').trim();
    const password = String(input.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw userError('Correo electrónico no válido.');
    if (fullName.length < 2 || fullName.length > 120) throw userError('El nombre debe tener entre 2 y 120 caracteres.');
    if (password.length < 12 || password.length > 200) throw userError('La contraseña debe tener entre 12 y 200 caracteres.');
    if (!roleNames.includes(input.role)) throw userError('Rol no válido.');
    const profileId = input.profile_id ? Number(input.profile_id) : null;
    const profileResource = input.role === 'student' ? 'students' : input.role === 'institution' ? 'institutions' : null;
    if (profileResource && profileId === null) {
      throw userError('Este rol requiere vincular un perfil existente.');
    }
    if (profileId !== null && (!Number.isSafeInteger(profileId) || profileId <= 0)) {
      throw userError('El ID del perfil debe ser un entero positivo.');
    }
    if (profileId !== null && !profileResource) {
      throw userError('Solo las cuentas de estudiante o institución se vinculan a un perfil.');
    }
    if (profileId !== null && !await profileRepository.get(profileResource, profileId)) {
      throw userError('El perfil seleccionado no existe.');
    }
    if (profileId !== null && await repository.findByProfile(input.role, profileId)) {
      throw userError('El perfil ya está vinculado a una cuenta.');
    }
    const now = clock();
    const user = await repository.insert({
      email,
      full_name: fullName,
      role: input.role,
      profile_id: profileId,
      password_hash: await passwordHasher.hash(password),
      created_at: now,
      updated_at: now
    });
    return publicUser(user);
  }

  async function authenticateUser(emailInput, passwordInput) {
    const email = String(emailInput || '').trim().toLowerCase();
    const user = await repository.findByEmail(email);
    const valid = user ? await passwordHasher.compare(String(passwordInput || ''), user.password_hash) : false;
    if (!valid) return null;
    return { token: tokenService.issue(user._id), user: publicUser(user) };
  }

  async function resolveToken(token) {
    const payload = tokenService.verify(token);
    if (!payload.jti || await repository.isTokenRevoked(payload.jti)) return null;
    const user = await repository.findById(Number(payload.sub));
    return user ? {
      ...publicUser(user),
      tokenId: payload.jti,
      tokenExpiresAt: new Date(payload.exp * 1000)
    } : null;
  }

  async function revokeToken(user) {
    if (!user?.tokenId || !user.tokenExpiresAt) return;
    await repository.revokeToken(user.tokenId, user.tokenExpiresAt);
  }

  async function getCurrentUser(id) {
    const user = await repository.findById(Number(id));
    return user ? publicUser(user) : null;
  }

  async function listUsers() {
    return repository.list();
  }

  async function emailInUse(emailInput) {
    const email = String(emailInput || '').trim().toLowerCase();
    return Boolean(email && await repository.findByEmail(email));
  }

  return { createUser, authenticateUser, resolveToken, revokeToken, getCurrentUser, listUsers, emailInUse };
}

export { roleNames as roles };
