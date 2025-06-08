import express from 'express';
import {
  createCampaign,
  getCampaignsByKnot,
  getCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaign.controller.js';

import authMiddlware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddlware, createCampaign);                    // Create campaign
router.get('/knot/:knotId', getCampaignsByKnot);     // Campaigns by knot
router.get('/:id', getCampaign);                     // Get one campaign
router.put('/:id', updateCampaign);                  // Update
router.delete('/:id', deleteCampaign);               // Delete

export default router;

