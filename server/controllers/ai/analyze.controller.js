// controllers/analyze.controller.js

import { analyzeUserProfile } from '../ai/profileAnalysis.controller.js'; // You’ll create this next
import prisma from '../../lib/prismaClient.js';

export const runInitialProfileAnalysis = async (req, res) => {
  const { userId } = req.body;

  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const aiResult = await analyzeUserProfile(profile);

    const saved = await prisma.suggestion.create({
      data: {
        userId,
        title: 'Initial AI Profile Analysis',
        content: aiResult,
        type: 'profile_analysis',
      },
    });

    res.status(200).json({ message: 'Profile analyzed', result: aiResult, saved });
  } catch (err) {
    console.error('🧠 Profile analysis error:', err);
    res.status(500).json({ message: 'Failed to analyze profile' });
  }
};

