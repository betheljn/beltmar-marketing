// server/routes/ai/chat.route.js
import express from 'express';
import { handleChatMessage } from '../controllers/ai/chat.controller.js';

const router = express.Router();

router.post('/chat', handleChatMessage);

export default router;
