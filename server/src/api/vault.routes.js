import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Vault access not implemented yet' });
});

export default router; 