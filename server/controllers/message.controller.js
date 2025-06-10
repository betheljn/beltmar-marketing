import prisma from '../lib/prismaClient.js';

export const getMessages = async (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = parseInt(req.params.userId);

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId },
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (err) {
    console.error('Get Messages Error:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
    const { userId } = req;
    const { recipientId } = req.params;
    const { cursor, limit = 20 } = req.query;
  
    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: Number(userId), recipientId: Number(recipientId) },
            { senderId: Number(recipientId), recipientId: Number(userId) }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        ...(cursor && {
          skip: 1,
          cursor: { id: Number(cursor) }
        })
      });
  
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };  

export const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { recipientId, content } = req.body;

  if (!recipientId || !content) {
    return res.status(400).json({ message: 'Missing recipient or content' });
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId: Number(recipientId),
        content
      }
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const deleteMessage = async (req, res) => {
  const messageId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message || message.senderId !== userId) {
      return res.status(403).json({ message: 'Unauthorized or message not found' });
    }

    await prisma.message.delete({ where: { id: messageId } });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Delete Message Error:', err);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

export const editMessage = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId; // From auth middleware
  
    try {
      const message = await prisma.message.findUnique({ where: { id: Number(id) } });
  
      if (!message || message.senderId !== userId) {
        return res.status(403).json({ error: 'Not authorized to edit this message.' });
      }
  
      const updated = await prisma.message.update({
        where: { id: Number(id) },
        data: { content }
      });
  
      return res.status(200).json(updated);
    } catch (err) {
      console.error('Edit message error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };  

  export const markMessagesAsRead = async (req, res) => {
    const { userId } = req;
    const { senderId } = req.body;
  
    try {
      await prisma.message.updateMany({
        where: {
          senderId: Number(senderId),
          recipientId: Number(userId),
          isRead: false
        },
        data: { isRead: true }
      });
  
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };  

  export const searchMessages = async (req, res) => {
    const { q, userId } = req.query;
  
    if (!q) {
      return res.status(400).json({ message: 'Search query missing' });
    }
  
    try {
      const messages = await prisma.message.findMany({
        where: {
          content: { contains: q, mode: 'insensitive' },
          OR: [
            { senderId: Number(userId) },
            { recipientId: Number(userId) }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
  
      res.status(200).json(messages);
    } catch (err) {
      console.error('Search error:', err.message);
      res.status(500).json({ message: 'Failed to search messages' });
    }
  };  


  
  