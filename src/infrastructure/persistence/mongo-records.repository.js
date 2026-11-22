const collections = new Set([
  'students', 'institutions', 'practices', 'hours', 'visits', 'validations',
  'evidence', 'users', 'counters'
]);

function collectionFor(database, resource) {
  if (!collections.has(resource)) throw new Error(`Colección no permitida: ${resource}.`);
  return database.collection(resource);
}

function mongoCriteria(criteria = {}) {
  return Object.fromEntries(Object.entries(criteria).map(([field, value]) => [
    field,
    Array.isArray(value) ? { $in: value } : value
  ]));
}

export function createMongoRecordsRepository(database) {
  return {
    async get(resource, id) {
      return collectionFor(database, resource).findOne({ _id: Number(id) });
    },
    async list(resource) {
      return collectionFor(database, resource).find({})
        .sort({ updated_at: -1, _id: -1 })
        .toArray();
    },
    async find(resource, criteria) {
      return collectionFor(database, resource).findOne(mongoCriteria(criteria));
    },
    async findMany(resource, criteria) {
      return collectionFor(database, resource).find(mongoCriteria(criteria)).toArray();
    },
    async nextId(resource) {
      const result = await database.collection('counters').findOneAndUpdate(
        { _id: resource },
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      return result.sequence;
    },
    async insert(resource, record) {
      await collectionFor(database, resource).insertOne(record);
    },
    async insertIfMissing(resource, record) {
      await collectionFor(database, resource).updateOne(
        { _id: record._id },
        { $setOnInsert: record },
        { upsert: true }
      );
    },
    async ensureSequence(resource, sequence) {
      await database.collection('counters').updateOne(
        { _id: resource },
        { $max: { sequence } },
        { upsert: true }
      );
    },
    async update(resource, id, patch) {
      const result = await collectionFor(database, resource).updateOne(
        { _id: Number(id) },
        { $set: patch }
      );
      return result.matchedCount > 0;
    },
    async delete(resource, id) {
      const result = await collectionFor(database, resource).deleteOne({ _id: Number(id) });
      return result.deletedCount > 0;
    },
    async deleteMany(resource, criteria) {
      const result = await collectionFor(database, resource).deleteMany(mongoCriteria(criteria));
      return result.deletedCount;
    }
  };
}
