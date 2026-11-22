import { resourceRouter } from './resource.routes.js';

export default function createVisitsRouter(recordsService) {
  return resourceRouter('visits', recordsService);
}
