import prisma from '../../lib/prismaClient.js';
import { analyzeWebsiteAndSocials } from '../../ai/profileAnalyzer.js';

export const updateUserProfile = async (req, res) => {
  const userId = req.user?.id;
  const { website, twitter, enableAIAnalysis } = req.body;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // Update user profile fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        website,
        twitter,
        enableAIAnalysis,
      },
    });

    let analysis = null;

    // If opted in, run AI analysis and store it
    if (enableAIAnalysis && (website || twitter)) {
      analysis = await analyzeWebsiteAndSocials({ website, twitter });

      await prisma.profileAnalysis.upsert({
        where: { userId },
        update: { summary: analysis },
        create: {
          userId,
          summary: analysis,
        },
      });
    }

    res.status(200).json({ user: updatedUser, analysis });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
