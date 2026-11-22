import { assertMethods } from './ports.js';

export function createHealthService(databaseHealth) {
  assertMethods('DatabaseHealthPort', databaseHealth, ['ping']);
  return {
    async check() {
      await databaseHealth.ping();
      return { status: 'ok', database: 'MongoDB' };
    }
  };
}
