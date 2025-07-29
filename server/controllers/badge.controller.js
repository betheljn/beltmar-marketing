import prisma from '../lib/prismaClient.js';

export const getAllBadges = async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { level: 'asc' }
    });

    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
};

export const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const earned = await prisma.userBadge.findMany({
      where: { userId: Number(userId) },
      include: { badge: true },
      orderBy: { grantedAt: 'desc' }
    });

    res.json(earned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
};
