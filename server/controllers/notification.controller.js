export const getNotifications = async (req, res) => {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(notifications);
  };
  
  export const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    const notification = await prisma.notification.updateMany({
      where: { id: Number(id), userId },
      data: { isRead: true }
    });
  
    res.status(200).json({ success: true });
  };
  