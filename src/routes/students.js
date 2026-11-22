import { resourceRouter } from './resource.routes.js';

export default function createStudentsRouter(recordsService) {
  return resourceRouter('students', recordsService);
}
