/**
 * Environment configuration for the backend server.
 * Loads from .env file if present, otherwise uses defaults.
 */

interface Config {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CORS_ORIGIN: string;
}

function getConfig(): Config {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['NODE_ENV'];
  const corsOrigin = process.env.CORS_ORIGIN || '*';

  return {
    PORT: port,
    NODE_ENV: nodeEnv,
    CORS_ORIGIN: corsOrigin,
  };
}

export const config = getConfig();
