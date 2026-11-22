import { MongoClient } from 'mongodb';

let client;
let database;

export function mongoConnectionConfig(env = process.env) {
  const uri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  if (/<(?:db_)?password>/i.test(uri)) {
    throw new Error('Reemplaza el marcador <db_password> en MONGODB_URI por la contraseña URL-encoded, o usa MONGODB_USERNAME y MONGODB_PASSWORD.');
  }
  const username = String(env.MONGODB_USERNAME || '').trim();
  const password = env.MONGODB_PASSWORD || '';
  const uriHasCredentials = /^mongodb(?:\+srv)?:\/\/[^/]*@/i.test(uri);

  if (Boolean(username) !== Boolean(password)) {
    throw new Error('Configura juntos MONGODB_USERNAME y MONGODB_PASSWORD, o incluye ambas credenciales en MONGODB_URI.');
  }
  if (uriHasCredentials && username) {
    throw new Error('No combines credenciales dentro de MONGODB_URI con MONGODB_USERNAME/MONGODB_PASSWORD; usa solo uno de los formatos.');
  }

  const options = { serverSelectionTimeoutMS: 5000 };
  if (username) {
    options.auth = { username, password };
    if (env.MONGODB_AUTH_SOURCE) options.authSource = env.MONGODB_AUTH_SOURCE;
  }
  return {
    uri,
    options,
    databaseName: env.MONGODB_DB || 'gestor_practicas'
  };
}

export function sanitizeConnectionFailure(error) {
  const causes = [];
  for (const server of error.reason?.servers?.values?.() || []) {
    let cause = server.error;
    for (let depth = 0; cause && depth < 4; depth += 1, cause = cause.cause) {
      if (cause.code && !causes.includes(cause.code)) causes.push(cause.code);
    }
  }
  return {
    type: error.name && error.name !== 'Error' ? error.name : null,
    code: error.code || null,
    topology: error.reason?.type || null,
    causes
  };
}

export async function connectDatabase() {
  if (database) return database;
  const { uri, options, databaseName } = mongoConnectionConfig();
  client ||= new MongoClient(uri, options);
  await client.connect();
  database = client.db(databaseName);
  await Promise.all([
    database.collection('students').createIndex({ code: 1 }, { unique: true }),
    database.collection('students').createIndex({ email: 1 }, { unique: true }),
    database.collection('institutions').createIndex({ name: 1 }, { unique: true }),
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
    database.collection('users').createIndex(
      { role: 1, profile_id: 1 },
      { unique: true, partialFilterExpression: { profile_id: { $type: 'number' } } }
    ),
    database.collection('hours').createIndex({ practice_id: 1, activity_date: -1 }),
    database.collection('visits').createIndex({ practice_id: 1, visit_date: -1 }),
    database.collection('validations').createIndex({ practice_id: 1, created_at: -1 }),
    database.collection('practices').createIndex({ student_id: 1, institution_id: 1 }),
    database.collection('evidence').createIndex({ practice_id: 1, created_at: -1 }),
    database.collection('revoked_tokens').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
  ]);
  return database;
}

export function getDatabase() {
  if (!database) throw new Error('La conexión con MongoDB todavía no está inicializada.');
  return database;
}

export async function closeDatabase() {
  database = undefined;
  if (client) await client.close();
  client = undefined;
}
