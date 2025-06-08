import fetch from 'node-fetch';

export const generateSuggestion = async (prompt, model = 'llama3') => {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
};


