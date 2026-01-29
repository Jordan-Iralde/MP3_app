import express, { Express } from 'express';
import cors from 'cors';
import 'dotenv/config';

import { config } from './config';
import healthRoutes from './routes/health';

const app: Express = express();

/**
 * Middleware configuration
 */
app.use(express.json());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

/**
 * Routes
 */
app.use('/', healthRoutes);

/**
 * Error handling for 404
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

/**
 * Start server
 */
app.listen(config.PORT, () => {
  const env = config.NODE_ENV === 'production' ? 'production' : 'development';
  console.log(`Backend running on port ${config.PORT} (${env})`);
});

