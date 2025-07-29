// server/controllers/ai/chat.controller.js
import axios from 'axios';
import prisma from '../../lib/prismaClient.js';

export const handleChatMessage = async (req, res) => {
  const { message, profile } = req.body;

  if (!message || !profile) {
    return res.status(400).json({ message: 'Missing user input or profile context' });
  }

  try {
    const prompt = `
You are an AI brand strategist and assistant.

User Profile:
- Name: ${profile.name || 'N/A'}
- Bio: ${profile.bio || 'N/A'}
- Industry: ${profile.industry || 'N/A'}
- Job Title: ${profile.jobTitle || 'N/A'}
- Style: ${profile.preferredStyle || 'N/A'}
- Interests: ${profile.interests?.join(', ') || 'N/A'}

User says: "${message}"

Respond helpfully, concisely, and with branding insight where possible.
If relevant, suggest one or two quick actions (e.g. "Analyze my Twitter", "Show my analytics", "Suggest a campaign").
Return your answer as markdown. If you have suggested actions, list them under a heading "Quick Actions".
`;

    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3.2:latest',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    const reply = response.data?.message?.content;

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('❌ AI chat error:', err.message);
    return res.status(500).json({ message: 'AI chat failed' });
  }
};
