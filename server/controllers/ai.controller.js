import { generateSuggestion } from '../ai/generate.js';
import { generateStrategy } from '../ai/strategy.js';
import { analyzeCampaign } from '../ai/analyze.js';
import { summarizeThread } from '../ai/summarize.js';

import prisma from '../lib/prismaClient.js';
import { logEvent } from '../utils/logEvent.js';

// ===== 1. GENERATE SUGGESTION =====
export const handleAIGenerate = async (req, res) => {
  try {
    const { brand, topic, tone, goal, userId, campaignId } = req.body;

    if (!brand || !topic || !tone || !goal || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const content = await generateSuggestion({ brand, topic, tone, goal });

    const suggestion = await prisma.suggestion.create({
      data: {
        campaignId,
        userId,
        title: `${brand} - ${topic}`.slice(0, 50),
        content: JSON.stringify(content, null, 2),
      },
    });

    await logEvent({
      userId,
      type: 'suggestion.created',
      targetId: suggestion.id,
      targetType: 'Suggestion',
      metadata: { topic, tone, goal },
    });

    res.json({ result: content, saved: suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI suggestion generation failed' });
  }
};

// ===== 2. GENERATE STRATEGY =====
export const handleAIStrategy = async (req, res) => {
  try {
    const { brand, audience, product, goal, userId, campaignId } = req.body;

    if (!brand || !audience || !product || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await generateStrategy({ brand, audience, product, goal });

    const strategy = await prisma.strategy.create({
      data: {
        campaignId,
        userId,
        title: `${brand} Strategy`,
        details: response,
      },
    });

    await logEvent({
      userId,
      type: 'strategy.created',
      targetId: strategy.id,
      targetType: 'Strategy',
      metadata: { brand, audience, goal },
    });

    res.json({ result: response, saved: strategy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI strategy generation failed' });
  }
};

// ===== 3. ANALYZE CAMPAIGN =====
export const handleAIAnalyze = async (req, res) => {
  try {
    const { summaryData, userId, model } = req.body;

    if (!summaryData || !userId) {
      return res.status(400).json({ error: 'Missing summaryData or userId' });
    }

    const result = await analyzeCampaign(summaryData, model || 'mixtral');

    const suggestion = await prisma.suggestion.create({
      data: {
        userId,
        title: 'Campaign Analysis',
        content: result,
      },
    });

    await logEvent({
      userId,
      type: 'campaign.analyzed',
      targetId: suggestion.id,
      targetType: 'Suggestion',
      metadata: { summaryData },
    });

    res.json({ result, saved: suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI campaign analysis failed' });
  }
};

// ===== 4. SUMMARIZE THREAD =====
export const handleAISummarize = async (req, res) => {
  try {
    const { threadContent, userId, model } = req.body;

    if (!threadContent || !userId) {
      return res.status(400).json({ error: 'Missing threadContent or userId' });
    }

    const result = await summarizeThread(threadContent, model || 'mixtral');

    const suggestion = await prisma.suggestion.create({
      data: {
        userId,
        title: 'Thread Summary',
        content: result,
      },
    });

    await logEvent({
      userId,
      type: 'thread.summarized',
      targetId: suggestion.id,
      targetType: 'Suggestion',
      metadata: { threadContent },
    });

    res.json({ result, saved: suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI thread summarization failed' });
  }
};

// ===== 5. VIEW HISTORY: By User =====
export const getSuggestionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, model, startDate, endDate } = req.query;

    const suggestions = await prisma.suggestion.findMany({
      where: {
        userId,
        ...(type && { type }),
        ...(model && { model }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch filtered user suggestions' });
  }
};

// ===== 6. VIEW HISTORY: By Campaign =====
export const getSuggestionsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { type, model, startDate, endDate } = req.query;

    const suggestions = await prisma.suggestion.findMany({
      where: {
        campaignId,
        ...(type && { type }),
        ...(model && { model }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch filtered campaign suggestions' });
  }
};


