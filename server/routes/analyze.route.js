import express from 'express';
import { analyzeUserProfile } from '../controllers/ai/profileAnalysis.controller.js';
import { runInitialProfileAnalysis } from '../controllers/ai/analyze.controller.js';

const router = express.Router();

router.post('/analyze-profile', analyzeUserProfile);
router.post('/profile', runInitialProfileAnalysis);

export default router;
