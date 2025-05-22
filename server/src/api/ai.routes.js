import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

router.post('/generate', (req, res) => {
  res.status(501).json({ message: 'AI generation not implemented yet' });
});

export default router; 