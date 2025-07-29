// controllers/profileAI.js
import { analyzeWebsite } from '../ai/analyzeWebsite.js';
import { analyzeTwitter } from '../ai/analyzeTwitter.js';
import { generateProfileSeed } from '../ai/profileSeed.js';
import prisma from '../lib/prismaClient.js';

export const handleAIProfileAnalysis = async (req, res) => {
  try {
    const { userId, website, twitter } = req.body;

    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const websiteData = website ? await analyzeWebsite(website) : {};
    const twitterData = twitter ? await analyzeTwitter(twitter) : {};

    const profileSeed = await generateProfileSeed({ websiteData, twitterData });

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileSeed: JSON.stringify(profileSeed),
        website,
        twitter,
        firstLogin: false,
      },
    });

    res.json({ success: true, profileSeed });
  } catch (err) {
    console.error('Profile AI Error:', err);
    res.status(500).json({ error: 'Failed to analyze profile' });
  }
};
