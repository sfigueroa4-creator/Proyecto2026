import path from 'node:path';
import { createRecordsService } from '../../application/records.service.js';
import { createUsersService } from '../../application/users.service.js';
import { createEvidenceService } from '../../application/evidence.service.js';
import { createHealthService } from '../../application/health.service.js';
import { createMongoRecordsRepository } from '../persistence/mongo-records.repository.js';
import { createMongoUsersRepository } from '../persistence/mongo-users.repository.js';
import { createMongoHealthRepository } from '../persistence/mongo-health.repository.js';
import { passwordHasher as defaultPasswordHasher } from '../security/bcrypt-password-hasher.js';
import { tokenService as defaultTokenService } from '../security/jwt-token-service.js';
import { createLocalEvidenceStorage } from '../storage/local-evidence.storage.js';

export function createServices({
  database,
  storageDirectory = path.resolve('uploads'),
  passwordHasher = defaultPasswordHasher,
  tokenService = defaultTokenService,
  clock
}) {
  const recordsRepository = createMongoRecordsRepository(database);
  const usersRepository = createMongoUsersRepository(database);
  const evidenceStorage = createLocalEvidenceStorage(storageDirectory);
  const records = createRecordsService({ repository: recordsRepository, evidenceStorage, clock });
  const users = createUsersService({
    repository: usersRepository,
    profileRepository: recordsRepository,
    passwordHasher,
    tokenService,
    clock
  });
  const evidence = createEvidenceService({
    repository: recordsRepository,
    recordsService: records,
    storage: evidenceStorage,
    clock
  });
  const health = createHealthService(createMongoHealthRepository(database));
  return { records, users, evidence, health };
}
