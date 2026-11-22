/**
 * @typedef {object} RecordsRepository
 * @property {(resource: string, id: number) => Promise<object|null>} get
 * @property {(resource: string) => Promise<object[]>} list
 * @property {(resource: string, criteria: object) => Promise<object|null>} find
 * @property {(resource: string, criteria: object) => Promise<object[]>} findMany
 * @property {(resource: string) => Promise<number>} nextId
 * @property {(resource: string, record: object) => Promise<void>} insert
 * @property {(resource: string, record: object) => Promise<void>} insertIfMissing
 * @property {(resource: string, sequence: number) => Promise<void>} ensureSequence
 * @property {(resource: string, id: number, patch: object) => Promise<boolean>} update
 * @property {(resource: string, id: number) => Promise<boolean>} delete
 * @property {(resource: string, criteria: object) => Promise<number>} deleteMany
 *
 * @typedef {object} UsersRepository
 * @property {(email: string) => Promise<object|null>} findByEmail
 * @property {(id: number) => Promise<object|null>} findById
 * @property {() => Promise<object[]>} list
 * @property {(user: object) => Promise<object>} insert
 * @property {(tokenId: string) => Promise<boolean>} isTokenRevoked
 * @property {(tokenId: string, expiresAt: Date) => Promise<void>} revokeToken
 *
 * @typedef {object} EvidenceStorage
 * @property {(file: object) => Promise<string>} save
 * @property {(name: string) => Promise<void>} remove
 * @property {(name: string) => string} pathFor
 */

export function assertMethods(name, dependency, methods) {
  for (const method of methods) {
    if (typeof dependency?.[method] !== 'function') {
      throw new TypeError(`${name} debe implementar ${method}().`);
    }
  }
}
