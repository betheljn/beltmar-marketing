import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { Server } from 'socket.io';
import http from 'http';

// Importing routes
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


const app = express();
const PORT = 1000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // adjust in prod
    methods: ['GET', 'POST']
  }
});

// Socket event handlers
io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;
  
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`✅ User ${userId} joined room: user:${userId}`);
  } else {
    console.warn('⚠️ No userId found in handshake auth');
  }

  console.log('🔌 New socket connected:', socket.id);

  socket.on('send-message', async ({ recipientId, content }) => {
    try {
      const newMessage = await prisma.message.create({
        data: {
          senderId: userId,
          recipientId,
          content
        }
      });

      io.to(`user:${recipientId}`).emit('receive-message', newMessage);
    } catch (err) {
      console.error('Socket message error:', err.message);
    }
  });

  // You can also add disconnect and other event listeners here
});

io.on('send-message', async ({ recipientId, content }) => {
  const senderId = socket.handshake.auth?.userId;

  if (!senderId || !recipientId || !content) {
    return;
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId: Number(senderId),
        recipientId: Number(recipientId),
        content,
      },
    });

    // Emit message to sender and recipient room
    io.to(`user:${senderId}`).emit('receive-message', message);
    io.to(`user:${recipientId}`).emit('receive-message', message);

    console.log(`📩 Message from ${senderId} to ${recipientId}:`, content);
  } catch (err) {
    console.error('Socket message error:', err.message);
  }
});

// Route setup
app.use('/api/auth', authRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/knots', knotRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/notifications', notificationRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`✅ Beltmar AI backend listening at http://localhost:${PORT}`);
});

export { io }; // Export the io instance for use in other modules
