export const sendMessage = async (req, res) => {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;
  
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required.' });
    }
  
    try {
      const message = await prisma.message.create({
        data: {
          senderId,
          recipientId: Number(recipientId),
          content,
        },
        include: {
          sender: true,
          recipient: true,
        }
      });
  
      io.emit('message:receive', message); // real-time push
  
      res.status(201).json(message);
    } catch (err) {
      console.error('Message Error:', err);
      res.status(500).json({ message: 'Failed to send message.' });
    }
  };

// Fetch messages between authenticated user and userId
export const fetchMessages = async (req, res) => {
    const userId = req.user.id;
    const otherId = Number(req.params.userId);
  
    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, recipientId: otherId },
            { senderId: otherId, recipientId: userId }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });
  
      res.json(messages);
    } catch (err) {
      console.error('Fetch Error:', err);
      res.status(500).json({ message: 'Failed to load messages.' });
    }
  };

  
  