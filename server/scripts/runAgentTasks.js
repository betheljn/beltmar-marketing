// devRunner.js
import { runAgentTasks } from './jobs/agent.taskRunner.js';

runAgentTasks().then(() => {
  console.log('✅ Agent task runner finished');
  process.exit();
});
