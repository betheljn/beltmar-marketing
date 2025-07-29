import { queryOllama } from '../lib/ollamaClient.js';


export const generateSuggestion = async ({ brand, topic, tone, goal }) => {
  const prompt = `
You are Belta, a smart AI content strategist.

Generate a social media post with:
- Brand: ${brand}
- Topic: ${topic}
- Tone: ${tone}
- Goal: ${goal}

Respond ONLY in this JSON format:
{
  "caption": "short, punchy sentence",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "imageIdea": "visual inspiration or theme",
  "callToAction": "what the user should do"
}
`;

  const response = await queryOllama({ prompt, model: 'llama3.2:latest' });

  try {
    return JSON.parse(response);
  } catch (err) {
    console.warn('⚠️ Failed to parse JSON from Ollama response:', response);
    return { caption: response }; // fallback
  }
};



