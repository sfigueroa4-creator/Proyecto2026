import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import apiRoutes from './src/routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', platform: os.platform() }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor.' });
});

app.listen(port, () => console.log(`Gestor de Prácticas disponible en http://localhost:${port}`));
