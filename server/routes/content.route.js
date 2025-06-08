import express from 'express';
import multer from 'multer';
import {
  createContent,
  createContentWithFiles,
  getContentByCampaign,
  getContent,
  updateContent,
  deleteContent,
} from '../controllers/content.controller.js';

import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateContentInput } from '../middleware/validate.middleware.js';


const router = express.Router();

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

// 🔐 Protect all routes with authentication
router.use(authenticateToken);

// ➕ Create content without file upload
router.post('/', validateContentInput, createContent);

// 📎 Create content with files
router.post(
  '/upload',
  upload.array('files', 5),           // or use uploadContentFiles if defined
  authenticateToken,                  // ✅ after multer to preserve req.body
  createContentWithFiles
);

// 📦 Get all content by campaign
router.get('/campaign/:campaignId', getContentByCampaign);

// 🔍 Get content by ID
router.get('/:id', getContent);

// ✏️ Update content
router.put('/:id', updateContent);

// ❌ Delete content
router.delete('/:id', deleteContent);

export default router;