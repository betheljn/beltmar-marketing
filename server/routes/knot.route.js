import express from 'express';
import { createKnot, 
        getKnot, 
        updateKnot, 
        deleteKnot, 
        getKnots 
    } from '../controllers/knot.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getKnots);
router.get('/:id', authMiddleware, getKnot);
router.post('/', authMiddleware, createKnot);
router.patch('/:id', authMiddleware, updateKnot);
router.delete('/:id', authMiddleware, deleteKnot);


export default router;
