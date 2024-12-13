import express from 'express';
import { config } from 'dotenv';
import projectRoutes from './routes/projects';
import cors from 'cors';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

const isDevelopment = process.env.NODE_ENV === 'development';

// CORS configuration
// const corsOptions = {
//   origin: isDevelopment
//     ? ['http://localhost:5173', 'http://localhost:5174'] // Add any other local dev URLs
//     : ['https://your-production-domain.com'], // Production URLs
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// };

app.use(cors({ origin: true }));

// Apply CORS middleware
// app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/projects', projectRoutes);
app.get('/hello-world', (req, res) =>
  res.status(200).json({ message: 'Hello World' })
);

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

app.listen(PORT, () => console.log(`API available on port ${PORT}`));
