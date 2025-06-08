import express from 'express';
import {
  addPerformance,
  getPerformanceByCampaign,
  deletePerformance,
  getPerformanceSummaryByCampaign
} from '../controllers/performance.controller.js';

const router = express.Router();

router.post('/', addPerformance);
router.get('/:campaignId', getPerformanceByCampaign);   
router.get('/summary/:campaignId', getPerformanceSummaryByCampaign); 
router.delete('/:id', deletePerformance);                 

export default router;

