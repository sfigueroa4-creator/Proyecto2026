import { Router } from 'express';
import { readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { URL } from 'node:url';

const router = Router();
// Ruta didáctica: cinco módulos nativos de Node.js usados en un ejemplo verificable.
router.get('/', async (req, res, next) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const parsedUrl = new URL(req.originalUrl, base); // node:url: interpreta la URL y sus parámetros.
    const publicFiles = await readdir(path.resolve('public')); // node:fs/promises: lista archivos públicos.
    res.json({
      uuid: randomUUID(), // node:crypto: identifica esta ejecución de demostración.
      platform: os.platform(), // node:os: informa el sistema operativo del servidor.
      publicFileCount: publicFiles.length,
      firstPublicFile: publicFiles[0] ? path.basename(publicFiles[0]) : null, // node:path: normaliza/extrae nombres.
      requestedPath: parsedUrl.pathname, // node:url: expone la ruta solicitada.
      queryParameters: Object.fromEntries(parsedUrl.searchParams)
    });
  } catch (error) { next(error); }
});
export default router;
