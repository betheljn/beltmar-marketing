import fetch from 'node-fetch';

export const summarizeThread = async (threadContent) => {
  const prompt = `
Summarize this content thread in a concise and engaging way:

${threadContent}

Include:
- Core message
- Tone
- Suggested next post
`;

  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:latest',
      prompt,
      stream: false,
    }),
  });

  const data = await res.json();
  return data.response;
};