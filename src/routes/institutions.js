import { resourceRouter } from './resource.routes.js';

export default function createInstitutionsRouter(recordsService) {
  return resourceRouter('institutions', recordsService);
}
