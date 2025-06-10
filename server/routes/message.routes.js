import express from 'express';
import { 
  getMessages, 
  sendMessage, 
  deleteMessage, 
  getMessagesBetweenUsers, 
  editMessage,
  markMessagesAsRead,
  searchMessages
} from '../controllers/message.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// 🔍 Search messages by content (must be first to avoid route conflict)
router.get('/search/messages', authMiddleware, searchMessages);

// 📩 Messages between two users (optional, or merge into getMessages)
router.get('/between/:recipientId', authMiddleware, getMessagesBetweenUsers);

// 📬 All messages with a specific user
router.get('/:userId', authMiddleware, getMessages);

// ✉️ Create, edit, delete, read
router.post('/', authMiddleware, sendMessage);
router.put('/:id', authMiddleware, editMessage);
router.delete('/:id', authMiddleware, deleteMessage);
router.post('/mark-read', authMiddleware, markMessagesAsRead);

export default router;

