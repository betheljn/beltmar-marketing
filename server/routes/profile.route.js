import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  upsertProfile,
  getProfileByUser,
  runInitialProfileAnalysis,
  updateUserProfile,
} from '../controllers/profile.controller.js';

const router = express.Router();

// Update profile fields (PATCH): /api/profile/:userId
router.patch('/:userId', authMiddleware, updateUserProfile);

// Upsert profile (can also be used for create/update): /api/profile/upsert/:userId
router.patch('/upsert/:userId', authMiddleware, upsertProfile);

// Get profile by userId: /api/profile/:userId
router.get('/:userId', authMiddleware, getProfileByUser);

// Initial AI Analysis: /api/profile/:userId/ai-analysis
router.post('/:userId/ai-analysis', authMiddleware, runInitialProfileAnalysis);

export default router;

