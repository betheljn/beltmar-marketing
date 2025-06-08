import express from 'express';
import { toggleReaction, getReactionsForComment } from '../controllers/reaction.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

// POST /api/reactions/:commentId
router.post('/:commentId', toggleReaction);

// GET /api/reactions/:commentId
router.get('/:commentId', getReactionsForComment);

export default router;
