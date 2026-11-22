export function createMongoHealthRepository(database) {
  return {
    ping() {
      return database.command({ ping: 1 });
    }
  };
}
