import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const extensions = new Map([
  ['application/pdf', '.pdf'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx']
]);

export function createLocalEvidenceStorage(directory) {
  return {
    async save(file) {
      const extension = extensions.get(file.mimetype);
      if (!extension) throw Object.assign(new Error('Tipo de archivo no permitido.'), { status: 415 });
      const name = `${randomUUID()}${extension}`;
      await fs.writeFile(path.join(directory, name), file.buffer, { flag: 'wx' });
      return name;
    },
    async remove(name) {
      try {
        await fs.unlink(path.join(directory, path.basename(name)));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    },
    pathFor(name) {
      return path.join(directory, path.basename(name));
    }
  };
}
