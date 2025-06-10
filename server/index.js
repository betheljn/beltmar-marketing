import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { Server } from 'socket.io';
import http from 'http';
import prisma from './lib/prismaClient.js';

// Routes
import authRoutes from './routes/auth.route.js';
import strategyRoutes from './routes/strategy.route.js';
import suggestionRoutes from './routes/suggestions.route.js';
import performanceRoutes from './routes/performance.route.js';
import campaignRoutes from './routes/campaign.route.js';
import aiRoutes from './routes/ai.route.js';
import contentRoutes from './routes/content.route.js';
import knotRoutes from './routes/knot.route.js';
import commentRoutes from './routes/comment.route.js';
import reactionRoutes from './routes/reaction.route.js';
import notificationRoutes from './routes/notification.route.js';
import messageRoutes from './routes/message.routes.js';
import groupRoutes from './routes/group.route.js';
import groupMessageRoutes from './routes/groupMessage.route.js';

const app = express();
const PORT = 1000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/knots', knotRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/group-messages', groupMessageRoutes);

// HTTP server + Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // set frontend origin in production
    methods: ['GET', 'POST']
  }
});

// Attach io instance to app for access in controllers
app.set('io', io);

// 🔌 Socket.IO Logic
io.on('connection', (socket) => {
  const userId = Number(socket.handshake.auth?.userId);

  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`✅ User ${userId} joined room: user:${userId}`);
  } else {
    console.warn('⚠️ No userId found in handshake auth');
    return;
  }

  console.log('🔌 Socket connected:', socket.id);

  // Join group room
socket.on('join-group', ({ groupId }) => {
  socket.join(`group:${groupId}`);
  console.log(`👥 User ${userId} joined group:${groupId}`);
});

// Send message to group
socket.on('send-group-message', async ({ groupId, content }) => {
  try {
    const newMessage = await prisma.message.create({
      data: {
        senderId: userId,
        groupId: Number(groupId),
        content
      }
    });

    io.to(`group:${groupId}`).emit('receive-group-message', newMessage);

    console.log(`📢 Group ${groupId} message from ${userId}:`, content);
  } catch (err) {
    console.error('💥 Group message error:', err.message);
  }
});

  // 📩 Handle sending message
  socket.on('send-message', async ({ recipientId, content }) => {
    try {
      if (!recipientId || !content) {
        return socket.emit('error', { message: 'Missing recipientId or content' });
      }

      const newMessage = await prisma.message.create({
        data: {
          senderId: userId,
          recipientId: Number(recipientId),
          content
        }
      });

      // Emit to both sender and recipient
      socket.emit('receive-message', newMessage);
      io.to(`user:${recipientId}`).emit('receive-message', newMessage);

      // 📣 Emit notification
      await prisma.notification.create({
        data: {
          userId: Number(recipientId),
          type: 'message.received',
          message: `New message from user ${userId}`,
          targetId: newMessage.id,
          targetType: 'Message'
        }
      });

      io.to(`user:${recipientId}`).emit('new-notification', {
        type: 'message.received',
        message: `New message from user ${userId}`,
        targetId: newMessage.id,
        targetType: 'Message'
      });

      console.log(`📩 Message sent from ${userId} ➡️ ${recipientId}: "${content}"`);
    } catch (err) {
      console.error('💥 send-message error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ✅ Acknowledge message as read
  socket.on('message-read', async ({ messageId }) => {
    try {
      const updated = await prisma.message.update({
        where: { id: Number(messageId) },
        data: { isRead: true }
      });

      io.to(`user:${updated.senderId}`).emit('message-read-confirmation', {
        messageId: updated.id,
        readAt: new Date()
      });

      console.log(`👁️ Message ${messageId} marked as read by ${userId}`);
    } catch (err) {
      console.error('💥 message-read error:', err.message);
    }
  });

  // 🟢 Typing indicator
  socket.on('typing', ({ recipientId }) => {
    io.to(`user:${recipientId}`).emit('user-typing', { senderId: userId });
  });

  // 🔴 Stop typing indicator
  socket.on('stop-typing', ({ recipientId }) => {
    io.to(`user:${recipientId}`).emit('user-stop-typing', { senderId: userId });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User ${userId} disconnected from socket ${socket.id}`);
  });
});

socket.on('group-message-read', async ({ groupId, messageId }) => {
  try {
    await prisma.groupMessageRead.upsert({
      where: {
        userId_groupId: {
          userId,
          groupId: Number(groupId)
        }
      },
      update: { readAt: new Date() },
      create: {
        userId,
        groupId: Number(groupId),
        readAt: new Date()
      }
    });

    socket.to(`group:${groupId}`).emit('group-message-read-confirmation', {
      groupId,
      messageId,
      readBy: userId
    });

    console.log(`👁️‍🗨️ Group message ${messageId} read by ${userId} in group ${groupId}`);
  } catch (err) {
    console.error('💥 group-message-read error:', err.message);
  }
});

io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  socket.on('join-group', ({ groupId }) => {
    socket.join(`group-${groupId}`);
  });

  socket.on('send-group-message', async ({ groupId, senderId, content }) => {
    const message = await prisma.groupMessage.create({
      data: { groupId, senderId, content },
    });

    io.to(`group-${groupId}`).emit('receive-group-message', message);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Beltmar server running on http://localhost:${PORT}`);
});