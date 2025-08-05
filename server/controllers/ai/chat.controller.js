import axios from 'axios';
import prisma from '../../lib/prismaClient.js';
import { buildChatPrompt } from '../../utils/buildprompt.js';

const sectionOrder = [
  'Brand Positioning',
  'Color Palette & Typography',
  'Tone of Voice',
  'Visual Identity',
  'Target Audience',
  'Campaign Ideas',
  'Content Strategy',
  'Platform/Channel Recommendations',
];

export const handleChatMessage = async (req, res) => {
  try {
    const { message, profile } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required and must be a string.' });
    }

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ message: 'Profile context is missing or invalid.' });
    }

    // 🧠 Fetch chat history for memory + last section
    const history = await prisma.chatLog.findMany({
      where: { userId: profile.userId },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });

    const pastMessages = history.flatMap((log) => {
      if (!log.message || !log.aiReply) return [];
      return [
        { role: 'user', content: log.message },
        { role: 'assistant', content: log.aiReply },
      ];
    });

    // 🧩 Determine current section logic
    let currentSection = sectionOrder[0]; // default
    const lastEntry = history[history.length - 1];
    const lastSection = lastEntry?.sectionName;

    if (lastSection) {
      const lastIndex = sectionOrder.indexOf(lastSection);
      const userSaidYes = message.trim().toLowerCase().includes('yes');
      if (userSaidYes && lastIndex >= 0 && lastIndex < sectionOrder.length - 1) {
        currentSection = sectionOrder[lastIndex + 1];
      } else {
        currentSection = lastSection;
      }
    }

    // ✍️ Build contextual prompt
    const prompt = buildChatPrompt(message, profile, currentSection);

    const aiRes = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3.2:latest',
      messages: [...pastMessages, { role: 'user', content: prompt }],
      stream: false,
    });

    const reply = aiRes.data?.message?.content;

    if (!reply) {
      return res.status(502).json({ message: 'AI returned no response.' });
    }

    // 🔍 Extract Quick Actions from reply (optional section)
    const extractQuickActions = (markdown) => {
      const section = markdown.split('### Quick Actions')[1];
      if (!section) return [];
      return section.split('\n').filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^-\s*/, '').trim());
    };

    const quickActions = extractQuickActions(reply);

    // 💾 Save full chat with section
    await prisma.chatLog.create({
      data: {
        userId: profile.userId,
        message,
        aiReply: reply,
        profile,
      },
    });

    return res.status(200).json({ reply, quickActions });
  } catch (err) {
    console.error('❌ AI chat error:', err?.response?.data || err.message, err.stack);
    return res.status(err?.response?.status || 500).json({ message: 'AI chat failed' });
  }
};

