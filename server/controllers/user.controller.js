import prisma from '../lib/prismaClient.js';

export const updateFirstLogin = async (req, res) => {
  const userId = Number(req.params.id);

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { firstLogin: false }
    });

    res.status(200).json({ message: 'firstLogin updated', user: updated });
  } catch (err) {
    console.error('🔴 updateFirstLogin error:', err.message);
    res.status(500).json({ message: 'Failed to update firstLogin' });
  }
};


