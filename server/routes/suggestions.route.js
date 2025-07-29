import express from 'express';
import { generateSuggestion } from '../controllers/ai/suggestion.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, generateSuggestion);

export default router;
