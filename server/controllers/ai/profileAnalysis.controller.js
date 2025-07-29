// ai/profileAnalysis.js
import axios from 'axios';

export const analyzeUserProfile = async (profile) => {
  const prompt = `
You are a brand strategist AI. Analyze the following user profile and return key insights, tone guidance, potential audience matches, and content strategy ideas.

Profile:
- Name: ${profile.name || 'N/A'}
- Bio: ${profile.bio || 'N/A'}
- Company: ${profile.company || 'N/A'}
- Job Title: ${profile.jobTitle || 'N/A'}
- Industry: ${profile.industry || 'N/A'}
- Website: ${profile.website || 'N/A'}
- Interests: ${profile.interests?.join(', ') || 'N/A'}
- Style: ${profile.preferredStyle || 'N/A'}

Please summarize and suggest 3 action items the user could take to grow their brand.

Return insights as markdown.
`;

  const res = await axios.post('http://localhost:11434/api/chat', {
    model: 'llama3.2:latest',
    messages: [{ role: 'user', content: prompt }],
    stream: false,
  });

  return res.data.message.content;
};
