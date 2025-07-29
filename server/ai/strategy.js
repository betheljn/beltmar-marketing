// ai/strategy.js
import { queryOllama } from '../lib/ollamaClient.js';

export const generateStrategy = async ({ brand, audience, product, goal }) => {
  const prompt = `
You are a top-tier marketing strategist. 
Create a complete digital marketing strategy for:

Brand: ${brand}
Target Audience: ${audience}
Product/Service: ${product}
Primary Goal: ${goal || 'Increase visibility and conversions'}

Include:
1. Campaign Concept
2. Brand Positioning
3. Messaging Strategy
4. Channels (social, paid, email, etc.)
5. Content Pillars
6. KPIs and Success Metrics
7. Engagement Tactics
8. Timeline Overview
`;

  const result = await queryOllama({ prompt, model: 'llama3.2:latest' });
  return result;
};

