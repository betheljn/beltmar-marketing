export const notifyUser = async ({ prisma, io, userId, type, message, targetId, targetType }) => {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        targetId,
        targetType
      }
    });
  
    io.to(`user:${userId}`).emit('notification', notification);
  
    return notification;
  };
  