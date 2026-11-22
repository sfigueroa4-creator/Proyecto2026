import { resourceRouter } from './resource.routes.js';

export default function createHoursRouter(recordsService) {
  return resourceRouter('hours', recordsService);
}
