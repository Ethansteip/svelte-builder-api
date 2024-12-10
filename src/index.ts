import express from 'express';
import { config } from 'dotenv';
import projectRoutes from './routes/projects';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/projects', projectRoutes);

// Basic error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
