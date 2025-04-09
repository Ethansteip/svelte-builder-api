import { Router } from 'express';
import projectRoutes from './projects';
import emailRoutes from './email';

const router = Router();

// Register all routes
router.use('/projects', projectRoutes);
router.use('/submit-email', emailRoutes);
router.get('/hello-world', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

// Simple health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

export default router;
