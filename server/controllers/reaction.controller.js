import prisma from '../lib/prismaClient.js';

// Toggle a reaction (add or remove if exists)
export const toggleReaction = async (req, res) => {
  const { commentId } = req.params;
  const { type } = req.body;
  const userId = req.user.id;

  if (!type) {
    return res.status(400).json({ message: 'Reaction type is required' });
  }

  try {
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_commentId_type: {
          userId,
          commentId: Number(commentId),
          type
        }
      }
    });

    if (existing) {
      await prisma.reaction.delete({
        where: {
          id: existing.id
        }
      });

      return res.status(200).json({ message: 'Reaction removed' });
    }

    const newReaction = await prisma.reaction.create({
      data: {
        userId,
        commentId: Number(commentId),
        type
      }
    });

    res.status(201).json(newReaction);
  } catch (err) {
    console.error('Toggle Reaction Error:', err.message);
    res.status(500).json({ message: 'Failed to toggle reaction' });
  }
};

// Get reactions for a comment
export const getReactionsForComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const reactions = await prisma.reaction.findMany({
      where: {
        commentId: Number(commentId)
      }
    });

    res.status(200).json(reactions);
  } catch (err) {
    console.error('Get Reactions Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch reactions' });
  }
};