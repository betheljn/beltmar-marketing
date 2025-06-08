import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);

export default router;