import express from 'express';
import {
  createProduct,
  updateProduct,
  getProductsByKnot,
  getProductById
} from '../controllers/product.controller.js';

const router = express.Router();

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.get('/knot/:knotId', getProductsByKnot);
router.get('/:id', getProductById);

export default router;
