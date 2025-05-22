import { auth } from 'express-oauth2-jwt-bearer';
import { logger } from '../utils/logger.js';

// Log Auth0 configuration (without sensitive data)
logger.info('Auth0 Configuration:', {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE
});

// Development bypass middleware
const bypassAuthInDev = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Add mock user data in development
    req.auth = {
      sub: 'dev-user',
      permissions: ['read:all', 'write:all'],
      scope: 'openid profile email'
    };
    return next();
  }
  return checkJwt(req, res, next);
};

// Auth0 middleware configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256'
});

// Export the appropriate middleware based on environment
export { bypassAuthInDev as checkJwt };

// Error handler for authentication
export const handleAuthError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    logger.error('Authentication error:', {
      error: err.message,
      code: err.code,
      status: err.status
    });
    return res.status(401).json({ 
      message: 'Invalid token or no token provided',
      error: err.message 
    });
  }
  if (err.name === 'InvalidTokenError') {
    logger.error('Invalid token error:', {
      error: err.message,
      code: err.code,
      status: err.status
    });
    return res.status(401).json({ 
      message: 'Invalid token',
      error: err.message 
    });
  }
  logger.error('Unexpected auth error:', err);
  next(err);
}; 