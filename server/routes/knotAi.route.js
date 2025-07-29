import express from 'express';
import {
  getKnotAISettings,
  updateKnotAISettings
} from '../controllers/knotAi.controller.js';

const router = express.Router();

router.get('/:knotId', getKnotAISettings);
router.put('/:knotId', updateKnotAISettings);

export default router;
