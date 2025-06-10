import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  createGroup,
  getGroupsForUser,
  addGroupMember
} from '../controllers/group.controller.js';

const router = express.Router();

router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getGroupsForUser);
router.post('/:id/members', authMiddleware, addGroupMember);

export default router;
