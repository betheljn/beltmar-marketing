import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { Server } from 'socket.io';
import http from 'http';
import prisma from './lib/prismaClient.js';
import session from 'express-session';

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
import agentRoutes from './routes/agent.route.js';
import knotAiRoutes from './routes/knotAi.route.js';
import badgeRoutes from './routes/badge.route.js';
import taskRoutes from './routes/task.route.js';
import productRoutes from './routes/product.route.js';
import userSettingRoutes from './routes/userSetting.route.js';
import userRoutes from './routes/user.route.js';
import analyzeRoutes from './routes/analyze.route.js';
import chatRoutes from './routes/chat.route.js';
import twitterRoutes from './routes/twitter.routes.js';
import profileRoutes from './routes/profile.route.js';

const app = express();
const PORT = 1000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'SuperSuperSecretSessionKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

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
app.use('/api/agents', agentRoutes);
app.use('/api/knot-ai', knotAiRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user-settings', userSettingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/ai', chatRoutes);
app.use('/api/twitter', twitterRoutes);
app.use('/api/profile', profileRoutes);


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

  // 📩 Direct message
  socket.on('send-message', async ({ recipientId, content }) => {
    try {
      const newMessage = await prisma.message.create({
        data: {
          senderId: userId,
          recipientId: Number(recipientId),
          content,
        },
      });

      socket.emit('receive-message', newMessage);
      io.to(`user:${recipientId}`).emit('receive-message', newMessage);

      await prisma.notification.create({
        data: {
          userId: Number(recipientId),
          type: 'message.received',
          message: `New message from user ${userId}`,
          targetId: newMessage.id,
          targetType: 'Message',
        },
      });

      io.to(`user:${recipientId}`).emit('new-notification', {
        type: 'message.received',
        message: `New message from user ${userId}`,
        targetId: newMessage.id,
        targetType: 'Message',
      });

      console.log(`📩 Message sent from ${userId} ➡️ ${recipientId}: "${content}"`);
    } catch (err) {
      console.error('💥 send-message error:', err.message);
    }
  });

  // ✅ Group join
  socket.on('join-group', ({ groupId }) => {
    socket.join(`group:${groupId}`);
    console.log(`👥 User ${userId} joined group:${groupId}`);
  });

  // ✅ Group message
  socket.on('send-group-message', async ({ groupId, content }) => {
    try {
      const message = await prisma.groupMessage.create({
        data: {
          senderId: userId,
          groupId: Number(groupId),
          content,
        },
      });

      io.to(`group:${groupId}`).emit('receive-group-message', message);
    } catch (err) {
      console.error('💥 group-message error:', err.message);
    }
  });

  // ✅ Group message read
  socket.on('group-message-read', async ({ groupId, messageId }) => {
    try {
      await prisma.groupMessageRead.upsert({
        where: {
          userId_groupId: {
            userId,
            groupId: Number(groupId),
          },
        },
        update: { readAt: new Date() },
        create: {
          userId,
          groupId: Number(groupId),
          readAt: new Date(),
        },
      });

      socket.to(`group:${groupId}`).emit('group-message-read-confirmation', {
        groupId,
        messageId,
        readBy: userId,
      });

      console.log(`👁️‍🗨️ Group message ${messageId} read by ${userId} in group ${groupId}`);
    } catch (err) {
      console.error('💥 group-message-read error:', err.message);
    }
  });

  // 📬 Mark message as read
  socket.on('message-read', async ({ messageId }) => {
    try {
      const updated = await prisma.message.update({
        where: { id: Number(messageId) },
        data: { isRead: true },
      });

      io.to(`user:${updated.senderId}`).emit('message-read-confirmation', {
        messageId: updated.id,
        readAt: new Date(),
      });

      console.log(`👁️ Message ${messageId} marked as read by ${userId}`);
    } catch (err) {
      console.error('💥 message-read error:', err.message);
    }
  });

  // ✍️ Typing
  socket.on('typing', ({ recipientId }) => {
    io.to(`user:${recipientId}`).emit('user-typing', { senderId: userId });
  });

  socket.on('stop-typing', ({ recipientId }) => {
    io.to(`user:${recipientId}`).emit('user-stop-typing', { senderId: userId });
  });

  // 📴 Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User ${userId} disconnected from socket ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Beltmar server running on http://localhost:${PORT}`);
});
