import express from 'express';
import {
  getAllBadges,
  getUserBadges
} from '../controllers/badge.controller.js';

const router = express.Router();

router.get('/', getAllBadges); // get all available badges
router.get('/user/:userId', getUserBadges); // get earned badges for a user

export default router;
