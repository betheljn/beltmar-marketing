import express from 'express';
import { createStrategy, getUserStrategies } from '../controllers/ai/strategy.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createStrategy);
router.get('/', authMiddleware, getUserStrategies);

export default router;
