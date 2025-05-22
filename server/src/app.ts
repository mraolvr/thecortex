import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { errorHandler } from './middleware/error.middleware.js';
import { handleAuthError } from './middleware/auth.middleware.js';
import { logger } from './utils/logger.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(dirname(__dirname), '.env');
logger.info(`Looking for .env file at: ${envPath}`);

if (fs.existsSync(envPath)) {
  config({ path: envPath });
  logger.info('Loaded .env file');
} else {
  logger.error('.env file not found at:', envPath);
  process.exit(1);
}

// Verify environment variables
const requiredEnvVars = ['AUTH0_DOMAIN', 'AUTH0_AUDIENCE', 'AUTH0_CLIENT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

logger.info('Environment configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  // Don't log sensitive values like CLIENT_SECRET
});

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5176',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', (await import('./api/auth.routes.js')).default);
app.use('/api/projects', (await import('./api/projects.routes.js')).default);
app.use('/api/tasks', (await import('./api/tasks.routes.js')).default);
app.use('/api/books', (await import('./api/books.routes.js')).default);
app.use('/api/journal', (await import('./api/journal.routes.js')).default);
app.use('/api/contacts', (await import('./api/contacts.routes.js')).default);
app.use('/api/vault', (await import('./api/vault.routes.js')).default);
app.use('/api/ai', (await import('./api/ai.routes.js')).default);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    env: process.env.NODE_ENV,
    auth0: {
      configured: !!process.env.AUTH0_DOMAIN && !!process.env.AUTH0_AUDIENCE
    }
  });
});

// Auth error handling
app.use(handleAuthError);

// General error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app; 