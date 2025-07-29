import prisma from '../lib/prismaClient.js';

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, knotId, status, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedTo,
        knotId,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined
      }
    });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined
      }
    });

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Get all tasks for a Knot
export const getTasksByKnot = async (req, res) => {
  try {
    const { knotId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { knotId: Number(knotId) },
      orderBy: { dueDate: 'asc' }
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch knot tasks' });
  }
};

// Get all tasks assigned to a User
export const getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { assignedTo: Number(userId) },
      orderBy: { dueDate: 'asc' }
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user tasks' });
  }
};
