import express from 'express';
import { updateFirstLogin } from '../controllers/user.controller.js';

const router = express.Router();

router.patch('/:id/first-login', updateFirstLogin);

export default router;
