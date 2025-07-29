import prisma from '../lib/prismaClient.js';

export const getUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    const settings = await prisma.userSetting.findMany({
      where: { userId: Number(userId) }
    });

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
};

export const updateUserSetting = async (req, res) => {
  try {
    const { userId } = req.params;
    const { key, value } = req.body;

    const updated = await prisma.userSetting.upsert({
      where: {
        userId_key: {
          userId: Number(userId),
          key
        }
      },
      update: { value },
      create: { userId: Number(userId), key, value }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user setting' });
  }
};
