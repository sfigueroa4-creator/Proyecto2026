import 'dotenv/config';
import { closeDatabase, connectDatabase, getDatabase, sanitizeConnectionFailure } from '../src/config/database.js';

try {
  await connectDatabase();
  await getDatabase().command({ ping: 1 });
  console.log(`Conexión MongoDB correcta. Base seleccionada: ${getDatabase().databaseName}.`);
} catch (error) {
  const details = sanitizeConnectionFailure(error);
  console.error(`No se pudo conectar a MongoDB. ${JSON.stringify(details)}`);
  if (details.causes.some((code) => code.startsWith('ERR_SSL_'))) {
    console.error('La negociación TLS falló antes de autenticar. Verifica el estado del clúster y la IP de acceso permitida en Atlas; revisa también firewall, VPN o inspección HTTPS/TLS.');
  } else {
    console.error('Verifica URI, credenciales, authSource, TLS, IP de acceso permitida y permisos de red.');
  }
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
