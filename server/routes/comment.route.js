// server/routes/comment.route.js
import express from 'express';
import multer from 'multer';
import {
  createComment,
  getCommentsByContent,
  updateComment,
  deleteComment,
  createCommentWithAttachments,
  replyToComment
} from '../controllers/comment.controller.js';

import { authenticateToken } from '../middleware/auth.middleware.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    isImage ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

const router = express.Router();

// Require auth for all comment routes
router.use(authenticateToken);

// Create a new comment
router.post('/', createComment);

// Create a comment with attachments
router.post('/upload', upload.array('files', 5), createCommentWithAttachments);

// Get all comments for a content item (threaded)
router.get('/content/:contentId', getCommentsByContent);

// Update a comment
router.put('/:id', updateComment);

// Delete a comment
router.delete('/:id', deleteComment);

// Reply to a comment
router.post('/:parentId/reply', authenticateToken, replyToComment);

export default router;
