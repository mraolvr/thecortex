import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const handleAuthError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === 'UnauthorizedError') {
    logger.warn('Authentication error:', err);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }
  next(err);
}; 