import express from 'express';
import {
  validateStrategyInput,
  validateGenerateInput
} from '../middleware/validate.middleware.js';

import {
  handleAIGenerate,
  handleAIStrategy,
  handleAIAnalyze,
  handleAISummarize,
  getSuggestionsByUser,
  getSuggestionsByCampaign,
} from '../controllers/ai.controller.js';

const router = express.Router();

// AI Routes
router.post('/generate', validateGenerateInput, handleAIGenerate);
router.post('/strategy', validateStrategyInput, handleAIStrategy);
router.post('/analyze', handleAIAnalyze);
router.post('/summarize', handleAISummarize);
router.get('/history/user/:userId', getSuggestionsByUser);
router.get('/history/campaign/:campaignId', getSuggestionsByCampaign);

export default router;

