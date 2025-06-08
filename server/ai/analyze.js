import fetch from 'node-fetch';

export const analyzeCampaign = async (summaryData) => {
  const prompt = `
You're an expert marketing analyst. Analyze this campaign performance:

${summaryData}

Return:
1. Performance breakdown
2. Bottlenecks
3. Opportunities for growth
4. Key takeaways
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