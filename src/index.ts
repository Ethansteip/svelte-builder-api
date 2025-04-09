import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import routes from './routes';
import ErrorMiddleware from './middleware/errorMiddleware';

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
    : [
        'https://svelte-forge-production.up.railway.app',
        'https://kit-forge.com'
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apply all routes
app.use('/', routes);

// 404 handler for undefined routes
app.use(ErrorMiddleware.notFound);

// Error handler
app.use(ErrorMiddleware.handleError);

app.listen(PORT, () => console.log(`API available on port ${PORT}`));
