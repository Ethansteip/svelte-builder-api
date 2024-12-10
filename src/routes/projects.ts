import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';

const router = Router();
const projectController = new ProjectController();

router.post('/create', projectController.createProject);

export default router;
