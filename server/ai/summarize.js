// ai/summarize.js
import { queryOllama } from '../lib/ollamaClient.js';

export const summarizeThread = async (threadContent) => {
  const prompt = `
Summarize this content thread in a concise and engaging way:

${threadContent}

Include:
- Core message
- Tone
- Suggested next post
`;

  const result = await queryOllama({ prompt, model: 'llama3.2:latest' });
  return result;
};