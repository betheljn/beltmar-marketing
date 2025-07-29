import prisma from '../lib/prismaClient.js';

// Create product
export const createProduct = async (req, res) => {
  try {
    const { knotId, name, description, price, stock, imageUrl } = req.body;

    const product = await prisma.product.create({
      data: {
        knotId,
        name,
        description,
        price,
        stock,
        imageUrl
      }
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, description, price, stock, imageUrl }
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Get products by Knot
export const getProductsByKnot = async (req, res) => {
  try {
    const { knotId } = req.params;

    const products = await prisma.product.findMany({
      where: { knotId: Number(knotId) },
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
