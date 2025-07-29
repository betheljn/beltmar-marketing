import express from 'express';
import {
  createTask,
  updateTask,
  getTasksByKnot,
  getTasksByUser
} from '../controllers/task.controller.js';

const router = express.Router();

router.post('/', createTask);
router.put('/:id', updateTask);
router.get('/knot/:knotId', getTasksByKnot);
router.get('/user/:userId', getTasksByUser);

export default router;
