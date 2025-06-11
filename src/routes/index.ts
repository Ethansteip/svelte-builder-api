import { Router } from 'express';
import projectRoutes from './projects';
import emailRoutes from './email';

const router = Router();

router.use('/projects', projectRoutes);
router.use('/submit-email', emailRoutes);

export default router;
