import prisma from '../lib/prismaClient.js';
import { logEvent } from '../utils/logEvent.js';

export const createKnot = async (req, res) => {
  const { name, description, parentId } = req.body;
  const userId = req.user.id;

  try {
    const knot = await prisma.knot.create({
      data: {
        name,
        description,
        userId,
        parentId: parentId ? Number(parentId) : null
      }
    });

    await logEvent({
      userId,
      type: 'knot.created',
      targetId: knot.id,
      targetType: 'Knot',
      metadata: { name, parentId }
    });

    res.status(201).json(knot);
  } catch (err) {
    console.error('Create Knot Error:', err.message);
    res.status(500).json({ message: 'Failed to create knot.' });
  }
};

export const getKnots = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const knots = await prisma.knot.findMany({
        where: { userId },
        include: {
          subKnots: true,
          parent: true
        }
      });
  
      res.status(200).json(knots);
    } catch (err) {
      console.error('Get Knots Error:', err.message);
      res.status(500).json({ message: 'Failed to fetch knots.' });
    }
  };
  
  export const updateKnot = async (req, res) => {
    const { id } = req.params;
    const { name, description, parentId } = req.body;
    const userId = req.user.id;
  
    try {
      const existing = await prisma.knot.findUnique({
        where: { id: Number(id) }
      });
  
      if (!existing || existing.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this knot.' });
      }
  
      const updated = await prisma.knot.update({
        where: { id: Number(id) },
        data: {
          name,
          description,
          parentId: parentId ? Number(parentId) : null
        }
      });
  
      await logEvent({
        userId,
        type: 'knot.updated',
        targetId: updated.id,
        targetType: 'Knot',
        metadata: { name }
      });
  
      res.status(200).json(updated);
    } catch (err) {
      console.error('Update Knot Error:', err.message);
      res.status(500).json({ message: 'Failed to update knot.' });
    }
  };

  export const deleteKnot = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const knot = await prisma.knot.findUnique({
        where: { id: Number(id) },
        include: { subKnots: true }
      });
  
      if (!knot || knot.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this knot.' });
      }
  
      if (knot.subKnots.length > 0) {
        return res.status(400).json({ message: 'Cannot delete a knot with sub-knots. Reassign or delete them first.' });
      }
  
      await prisma.knot.delete({ where: { id: Number(id) } });
  
      await logEvent({
        userId,
        type: 'knot.deleted',
        targetId: Number(id),
        targetType: 'Knot'
      });
  
      res.status(204).send();
    } catch (err) {
      console.error('Delete Knot Error:', err.message);
      res.status(500).json({ message: 'Failed to delete knot.' });
    }
  };

  export const getKnot = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      const knot = await prisma.knot.findUnique({
        where: { id: Number(id) },
        include: {
          subKnots: true,
          campaigns: true,
          aiSettings: true,
          tasks: true,
          products: true,
          parent: true
        }
      });
  
      if (!knot || knot.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this knot.' });
      }
  
      await logEvent({
        userId,
        type: 'knot.viewed',
        targetId: knot.id,
        targetType: 'Knot'
      });
  
      res.status(200).json(knot);
    } catch (err) {
      console.error('Get Knot Error:', err.message);
      res.status(500).json({ message: 'Failed to fetch knot.' });
    }
  };  