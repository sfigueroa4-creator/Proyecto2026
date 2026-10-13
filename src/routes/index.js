import { Router } from 'express';
import students from './students.js';
import institutions from './institutions.js';
import practices from './practices.js';
import hours from './hours.js';
import services from './services.js';

const router = Router();
router.use('/students', students);
router.use('/institutions', institutions);
router.use('/practices', practices);
router.use('/hours', hours);
router.use('/services', services);
export default router;
