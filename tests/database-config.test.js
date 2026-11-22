import test from 'node:test';
import assert from 'node:assert/strict';
import { mongoConnectionConfig, sanitizeConnectionFailure } from '../src/config/database.js';

test('MongoDB accepts username and password separately without embedding secrets in URI', () => {
  const config = mongoConnectionConfig({
    MONGODB_URI: 'mongodb+srv://cluster.example.net/?retryWrites=true&w=majority',
    MONGODB_DB: 'practice_test',
    MONGODB_USERNAME: 'application-user',
    MONGODB_PASSWORD: 'secret with symbols @:/',
    MONGODB_AUTH_SOURCE: 'admin'
  });
  assert.equal(config.uri, 'mongodb+srv://cluster.example.net/?retryWrites=true&w=majority');
  assert.equal(config.databaseName, 'practice_test');
  assert.deepEqual(config.options.auth, {
    username: 'application-user',
    password: 'secret with symbols @:/'
  });
  assert.equal(config.options.authSource, 'admin');
  assert.equal(config.options.serverSelectionTimeoutMS, 5000);
});

test('MongoDB accepts a standard URI that already contains credentials', () => {
  const config = mongoConnectionConfig({
    MONGODB_URI: 'mongodb+srv://user:encoded-password@cluster.example.net/practices'
  });
  assert.equal(config.uri, 'mongodb+srv://user:encoded-password@cluster.example.net/practices');
  assert.equal(config.options.auth, undefined);
});

test('MongoDB rejects a missing half of separately configured credentials', () => {
  assert.throws(
    () => mongoConnectionConfig({ MONGODB_URI: 'mongodb://db.example.net', MONGODB_USERNAME: 'user' }),
    /Configura juntos/
  );
  assert.throws(
    () => mongoConnectionConfig({ MONGODB_URI: 'mongodb://db.example.net', MONGODB_PASSWORD: 'password' }),
    /Configura juntos/
  );
});

test('MongoDB rejects credentials configured in both URI and separate variables', () => {
  assert.throws(
    () => mongoConnectionConfig({
      MONGODB_URI: 'mongodb://user:password@db.example.net',
      MONGODB_USERNAME: 'user',
      MONGODB_PASSWORD: 'password'
    }),
    /No combines credenciales/
  );
});

test('MongoDB gives a clear error if the provider URI password placeholder was not replaced', () => {
  assert.throws(
    () => mongoConnectionConfig({ MONGODB_URI: 'mongodb+srv://app:<db_password>@cluster.example.net/' }),
    /Reemplaza el marcador/
  );
});

test('connection diagnostics report TLS codes without exposing nested error messages', () => {
  const error = {
    name: 'MongoServerSelectionError',
    reason: {
      type: 'ReplicaSetNoPrimary',
      servers: new Map([['atlas-host', {
        error: {
          name: 'MongoNetworkError',
          cause: Object.assign(new Error('secret must not leak'), { code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR' })
        }
      }]])
    }
  };
  assert.deepEqual(sanitizeConnectionFailure(error), {
    type: 'MongoServerSelectionError',
    code: null,
    topology: 'ReplicaSetNoPrimary',
    causes: ['ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR']
  });
});
