import fetch from 'node-fetch';

export const queryOllama = async ({ prompt, model = 'llama3', stream = false }) => {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream }),
  });

  const data = await res.json();
  return data.response;
};
