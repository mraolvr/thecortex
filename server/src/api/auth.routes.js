import { Router } from 'express';
import { checkJwt, handleAuthError } from '../middleware/auth.middleware.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get user profile
router.get('/profile', checkJwt, handleAuthError, async (req, res) => {
  try {
    logger.info('Fetching user profile for:', req.auth.sub);
    
    // The user information is available in req.auth
    const userInfo = {
      sub: req.auth.sub,
      permissions: req.auth.permissions || [],
      scope: req.auth.scope,
      // Add any other claims from the token that you need
    };
    
    res.json(userInfo);
  } catch (error) {
    logger.error('Error fetching user profile:', {
      error: error.message,
      userId: req?.auth?.sub
    });
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Verify token
router.get('/verify', checkJwt, handleAuthError, (req, res) => {
  logger.info('Token verified for user:', req.auth.sub);
  res.status(200).json({ 
    message: 'Token is valid',
    user: req.auth.sub
  });
});

// Health check endpoint (public)
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    auth: {
      domain: process.env.AUTH0_DOMAIN,
      audience: process.env.AUTH0_AUDIENCE
    }
  });
});

// Logout route (client-side only)
router.post('/logout', (req, res) => {
  // Auth0 logout is handled on the client side
  logger.info('User logged out (client-side)');
  res.status(200).json({ message: 'Logout successful' });
});

export default router; 