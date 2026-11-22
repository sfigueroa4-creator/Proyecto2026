import 'dotenv/config';
import { closeDatabase, connectDatabase, getDatabase } from '../src/config/database.js';
import { createServices } from '../src/infrastructure/composition/create-services.js';

try {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const full_name = process.env.BOOTSTRAP_ADMIN_NAME || 'Administrador del sistema';
  if (!email || !password) throw new Error('Define BOOTSTRAP_ADMIN_EMAIL y BOOTSTRAP_ADMIN_PASSWORD en .env.');
  await connectDatabase();
  const users = createServices({ database: getDatabase() }).users;
  if (await users.emailInUse(email)) throw new Error('Ya existe una cuenta con ese correo; no se modificó.');
  const user = await users.createUser({ email, password, full_name, role: 'admin' });
  console.log(`Cuenta administradora creada: ${user.email} (id ${user.id}).`);
} catch (error) {
  console.error('No se pudo crear el administrador:', error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
