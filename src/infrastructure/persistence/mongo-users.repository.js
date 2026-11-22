export function createMongoUsersRepository(database) {
  const users = database.collection('users');
  const revokedTokens = database.collection('revoked_tokens');
  return {
    findByEmail(email) {
      return users.findOne({ email });
    },
    findById(id) {
      return users.findOne({ _id: Number(id) });
    },
    findByProfile(role, profileId) {
      return users.findOne({ role, profile_id: Number(profileId) });
    },
    async list() {
      const records = await users.find({}, { projection: { password_hash: 0 } }).sort({ email: 1 }).toArray();
      return records.map(({ _id, ...user }) => ({ ...user, id: _id }));
    },
    async insert(user) {
      const counter = await database.collection('counters').findOneAndUpdate(
        { _id: 'users' },
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      const record = { _id: counter.sequence, ...user };
      await users.insertOne(record);
      return record;
    },
    async isTokenRevoked(tokenId) {
      return Boolean(await revokedTokens.findOne({ _id: tokenId }));
    },
    async revokeToken(tokenId, expiresAt) {
      await revokedTokens.updateOne(
        { _id: tokenId },
        { $setOnInsert: { expires_at: expiresAt } },
        { upsert: true }
      );
    }
  };
}
