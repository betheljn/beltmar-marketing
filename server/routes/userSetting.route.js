import express from 'express';
import {
  getUserSettings,
  updateUserSetting
} from '../controllers/userSetting.controller.js';

const router = express.Router();

router.get('/:userId', getUserSettings);
router.put('/:userId', updateUserSetting);

export default router;
