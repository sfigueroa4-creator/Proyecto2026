import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './src/routes/index.js';
import { closeDatabase, connectDatabase, getDatabase } from './src/config/database.js';
import { createServices } from './src/infrastructure/composition/create-services.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(root, 'public')));

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configura JWT_SECRET en .env con al menos 32 caracteres aleatorios.');
  }
  await fs.mkdir(path.join(root, 'uploads'), { recursive: true });
  await connectDatabase();
  const applicationServices = createServices({
    database: getDatabase(),
    storageDirectory: path.join(root, 'uploads')
  });
  app.get('/api/health', async (_req, res, next) => {
    try { res.json({ ...await applicationServices.health.check(), platform: os.platform() }); } catch (error) { next(error); }
  });
  app.use('/api', createApiRouter(applicationServices));
  app.use((error, _req, res, _next) => {
    console.error(error);
    if (error.code === 11000) return res.status(409).json({ error: 'Ya existe un registro con ese valor único.' });
    if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'El archivo supera el límite de 10 MB.' });
    const status = error.status || 500;
    res.status(status).json({ error: status >= 500 ? 'Error interno del servidor.' : error.message });
  });
  const server = app.listen(port, () => console.log(`Gestor de Prácticas disponible en http://localhost:${port}`));
  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('No se pudo iniciar el servicio:', error);
  process.exitCode = 1;
});
