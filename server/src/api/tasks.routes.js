import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Tasks list not implemented yet' });
});

export default router; 