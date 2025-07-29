// jobs/agent.taskRunner.js

import prisma from '../lib/prismaClient.js';
import { generateSuggestion } from '../ai/generate.js';
import { generateStrategy } from '../ai/strategy.js';
import { analyzeCampaign } from '../ai/analyze.js';
import { summarizeThread } from '../ai/summarize.js';

export const runAgentTasks = async () => {
  const tasks = await prisma.agentTask.findMany({
    where: { status: 'pending' },
    take: 5, // optional batching
  });

  for (const task of tasks) {
    try {
      // Step 1: Mark as running
      await prisma.agentTask.update({
        where: { id: task.id },
        data: { status: 'running' }
      });

      let output;

      // Step 2: Run the actual task
      switch (task.type) {
        case 'generate':
          output = await generateSuggestion(task.input);
          break;
        case 'strategy':
          output = await generateStrategy(task.input);
          break;
        case 'analyze':
          output = await analyzeCampaign(task.input.summaryData);
          break;
        case 'summarize':
          output = await summarizeThread(task.input.threadContent);
          break;
        default:
          throw new Error(`Unknown agent task type: ${task.type}`);
      }

      // Step 3: On success, update task
      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          output,
          log: `Task completed at ${new Date().toISOString()}`
        }
      });

      console.log(`✅ AgentTask ${task.id} (${task.type}) completed.`);

    } catch (err) {
      console.error(`❌ AgentTask ${task.id} failed:`, err.message);

      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          status: 'failed',
          retryCount: task.retryCount + 1,
          log: `Error: ${err.message}`
        }
      });
    }
  }
};

