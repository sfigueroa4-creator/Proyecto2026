import { resourceRouter } from './resource.routes.js';

export default function createValidationsRouter(recordsService) {
  return resourceRouter('validations', recordsService);
}
