import prisma from '../lib/prismaClient.js';

// Send a group message
export const sendGroupMessage = async (req, res) => {
  const { id: groupId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  try {
    const message = await prisma.groupMessage.create({
      data: {
        groupId: Number(groupId),
        senderId,
        content,
      },
      include: { sender: true }
    });

    // Emit via socket
    const io = req.app.get('io');
    const members = await prisma.groupMember.findMany({
      where: { groupId: Number(groupId) },
      select: { userId: true }
    });

    members.forEach(({ userId }) => {
      io.to(`user:${userId}`).emit('group-message', message);
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('❌ Send Group Message Error:', err.message);
    res.status(500).json({ message: 'Failed to send message.' });
  }
};

// Get messages in a group
export const getGroupMessages = async (req, res) => {
  const { id: groupId } = req.params;

  try {
    const messages = await prisma.groupMessage.findMany({
      where: { groupId: Number(groupId) },
      include: { sender: true },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Get Group Messages Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
};

// Mark group messages as read
export const markGroupMessagesRead = async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user.id;

  try {
    const readAt = new Date();
    await prisma.groupMessageRead.upsert({
      where: { userId_groupId: { userId, groupId: Number(groupId) } },
      update: { readAt },
      create: { userId, groupId: Number(groupId), readAt }
    });

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search group messages by content
export const searchGroupMessages = async (req, res) => {
  const { groupId, query } = req.query;

  try {
    const results = await prisma.groupMessage.findMany({
      where: {
        groupId: Number(groupId),
        content: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
