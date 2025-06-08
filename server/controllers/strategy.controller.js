import prisma from '../lib/prismaClient.js';

export const createStrategy = async (req, res) => {
  const { title, description, type } = req.body;
  const userId = req.user?.id; // Requires auth middleware

  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const strategy = await prisma.strategy.create({
      data: {
        title,
        description,
        type,
        userId,
      },
    });

    res.status(201).json(strategy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create strategy' });
  }
};

export const getUserStrategies = async (req, res) => {
  const userId = req.user?.id;

  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const strategies = await prisma.strategy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(strategies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch strategies' });
  }
};
