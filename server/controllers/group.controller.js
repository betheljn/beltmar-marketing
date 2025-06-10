import prisma from '../lib/prismaClient.js';

// Create a new group
export const createGroup = async (req, res) => {
  const { name, memberIds = [] } = req.body;
  const createdBy = req.user.id;

  try {
    const group = await prisma.group.create({
      data: {
        name,
        createdBy,
        members: {
          create: [
            { userId: createdBy, role: 'admin' },
            ...memberIds.map(userId => ({ userId: Number(userId), role: 'member' }))
          ]
        }
      },
      include: { members: true }
    });

    res.status(201).json(group);
  } catch (err) {
    console.error('❌ Create Group Error:', err.message);
    res.status(500).json({ message: 'Failed to create group.' });
  }
};

// Get all groups a user is part of
export const getGroupsForUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        members: { include: { user: true } }
      }
    });

    res.status(200).json(groups);
  } catch (err) {
    console.error('❌ Get Groups Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch groups.' });
  }
};

// Add member to group
export const addGroupMember = async (req, res) => {
  const { id: groupId } = req.params;
  const { userId } = req.body;
  const currentUserId = req.user.id;

  try {
    const requester = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: currentUserId, groupId: Number(groupId) } }
    });

    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can add members' });
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: Number(groupId),
        userId: Number(userId),
        role: 'member'
      }
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

