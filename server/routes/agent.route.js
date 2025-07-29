import express from 'express';
import { queueAgentTask, getAgentTasksByUser } from '../controllers/agent.controller.js';

const router = express.Router();

router.post('/queue', queueAgentTask); // for Belta to queue a task
router.get('/user/:userId', getAgentTasksByUser); // history (optional)

export default router;