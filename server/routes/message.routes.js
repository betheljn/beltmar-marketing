import express from 'express';
import { sendMessage, fetchMessages } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, sendMessage);
router.get('/:userId', authenticate, fetchMessages);

export default router;
