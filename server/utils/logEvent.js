import prisma from '../lib/prismaClient.js';

export const logEvent = async ({ userId, type, targetId, targetType, metadata }) => {
  try {
    await prisma.eventLog.create({
      data: {
        userId,
        type,
        targetId,
        targetType,
        metadata,
      }
    });
  } catch (err) {
    console.error('Failed to log event:', err);
  }
};
