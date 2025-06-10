import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  sendGroupMessage,
  getGroupMessages,
  markGroupMessagesRead,
  searchGroupMessages
} from '../controllers/groupMessage.controller.js';

const router = express.Router();

router.post('/:id/messages', authMiddleware, sendGroupMessage);
router.get('/:id/messages', authMiddleware, getGroupMessages);
router.post('/mark-read', authMiddleware, markGroupMessagesRead);
router.get('/search', authMiddleware, searchGroupMessages);

export default router;
