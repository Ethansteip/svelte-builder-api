import express from 'express';
import { config } from 'dotenv';
import projectRoutes from './routes/projects';
import emailRoutes from './routes/email';
import cors from 'cors';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS configuration
const corsOptions = {
  origin: isDevelopment
    ? ['http://localhost:5173']
    : ['https://svelte-forge-production.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/projects', projectRoutes);
app.use('/submit-email', emailRoutes);
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
