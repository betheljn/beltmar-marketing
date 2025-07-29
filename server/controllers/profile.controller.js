import prisma from '../lib/prismaClient.js';
import { analyzeProfile } from '../ai/analyze.js';

// Upsert (Create or Update) a user profile
export const upsertProfile = async (req, res) => {
  const { userId } = req.params;

  const {
    name,
    bio,
    avatarUrl,
    location,
    company,
    website,
    jobTitle,
    industry,
    interests,
    socialLinks,
    lastActiveAt,
    preferredStyle,
    aiInteractionLog,
    businessType,
    platforms,
    tone,
    customTone,
    challenges,
    contentTypes,
    contentCustom,
    involvement,
    targetAudience,
    competitors,
  } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: Number(userId) },
      update: {
        name,
        bio,
        avatarUrl,
        location,
        company,
        website,
        jobTitle,
        industry,
        interests,
        socialLinks,
        lastActiveAt,
        preferredStyle,
        aiInteractionLog,
        businessType,
        platforms,
        tone,
        customTone,
        challenges,
        contentTypes,
        contentCustom,
        involvement,
        targetAudience,
        competitors,
      },
      create: {
        userId: Number(userId),
        name,
        bio,
        avatarUrl,
        location,
        company,
        website,
        jobTitle,
        industry,
        interests,
        socialLinks,
        lastActiveAt,
        preferredStyle,
        aiInteractionLog,
        businessType,
        platforms,
        tone,
        customTone,
        challenges,
        contentTypes,
        contentCustom,
        involvement,
        targetAudience,
        competitors,
      },
    });

    res.status(200).json(profile);
  } catch (err) {
    console.error('🛑 Error in upsertProfile:', err);
    res.status(500).json({ error: 'Failed to create or update profile.' });
  }
};

// Optional: Get profile by userId
export const getProfileByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: Number(userId) },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    res.json(profile);
  } catch (err) {
    console.error('🛑 Error in getProfileByUser:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

export const runInitialProfileAnalysis = async (req, res) => {
    const userId = Number(req.params.userId);
    console.log('AI Analysis called for userId:', userId, req.params);
  
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });
  
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
  
      const aiInput = {
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        website: profile.website,
        jobTitle: profile.jobTitle,
        industry: profile.industry,
        interests: profile.interests,
        socialLinks: profile.socialLinks,
      };
  
      const result = await analyzeProfile(aiInput);
  
      // Store under aiInteractionLog.initialAnalysis
      await prisma.profile.update({
        where: { userId },
        data: {
          aiInteractionLog: {
            ...(profile.aiInteractionLog || {}),
            initialAnalysis: result,
          },
        },
      });
  
      res.status(200).json({ message: 'AI analysis complete', analysis: result });
    } catch (err) {
      console.error('🔴 runInitialProfileAnalysis error:', err.message);
      res.status(500).json({ message: 'Failed to analyze profile' });
    }
  };

  export const updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;
  
    try {
      const updated = await prisma.profile.update({
        where: { userId: Number(userId) },
        data: updateData,
      });
      res.json(updated);
    } catch (err) {
      console.error('🛑 Error updating profile:', err);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  };