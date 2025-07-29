import prisma from '../lib/prismaClient.js';

// ===== Queue a New Task =====
export const queueAgentTask = async (req, res) => {
  try {
    const { userId, campaignId, type, input } = req.body;

    if (!userId || !type || !input) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const task = await prisma.agentTask.create({
      data: {
        userId,
        campaignId,
        type,
        status: 'pending',
        input,
      },
    });

    res.json({ message: 'Agent task queued successfully', task });
  } catch (err) {
    console.error('❌ Failed to queue agent task:', err.message);
    res.status(500).json({ error: 'Failed to queue agent task' });
  }
};

// ===== Optional: View Tasks by User =====
export const getAgentTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await prisma.agentTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agent tasks' });
  }
};
