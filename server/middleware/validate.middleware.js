// middleware/validate.middleware.js

export const validateStrategyInput = (req, res, next) => {
    const { brand, audience, product, userId, campaignId } = req.body;
  
    if (!brand || !audience || !product || !userId || !campaignId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    next();
  };  
  
  export const validateGenerateInput = (req, res, next) => {
    const { prompt } = req.body;
  
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required and must be a string.'
      });
    }
    next();
  };
  
  export const validateCampaignInput = (req, res, next) => {
    const { name, knotId, userId } = req.body;
  
    if (!name || !knotId || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: name, knotId, or userId.'
      });
    }
    next();
  };
  
  export const validatePerformanceInput = (req, res, next) => {
    const { campaignId, userId, impressions, clicks, conversions } = req.body;
  
    if (!campaignId || !userId || impressions == null || clicks == null || conversions == null) {
      return res.status(400).json({
        error: 'Missing required performance fields.'
      });
    }
    next();
  };

  export const validateContentInput = (req, res, next) => {
    const { campaignId, type, platform, content } = req.body || {};
  
    if (!campaignId || !type || !platform || !content) {
      return res.status(400).json({ message: 'Missing required content fields' });
    }
  
    next();
  };  
  
  