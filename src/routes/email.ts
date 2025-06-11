import { Router } from 'express';
import { ProjectController } from '../controllers';

const router = Router();
const projectController = new ProjectController();

router.post('/', projectController.submitEmail);

export default router;
