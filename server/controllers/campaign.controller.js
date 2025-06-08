import prisma from '../lib/prismaClient.js';
import { logEvent } from '../utils/logEvent.js';

// Create a campaign under a knot
export const createCampaign = async (req, res) => {
  try {
    const { knotId, name, description } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not found in request' });
    }

    const userId = req.user.id;

    const created = await prisma.campaign.create({
      data: {
        knotId: Number(knotId),
        name,
        description,
        userId
      }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('Create Campaign Error:', err.message);
    res.status(500).json({ message: 'Failed to create campaign.' });
  }
};

// Get all campaigns for a specific knot
export const getCampaignsByKnot = async (req, res) => {
  const { knotId } = req.params;
  const { skip = 0, take = 10 } = req.query;

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { knotId: Number(knotId) },
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(take)
    });

    await logEvent({
      userId: req.user.id,
      type: 'campaign.viewed_list',
      targetType: 'Knot',
      targetId: Number(knotId),
      metadata: { count: campaigns.length }
    });    

    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Get Campaigns Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch campaigns.' });
  }
};

// Get a single campaign by ID
export const getCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: Number(id) },
      include: {
        suggestions: true,
        performances: true,
        contents: true,
        strategy: true, // if only one strategy per campaign
      }
    });    

    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    await logEvent({
      userId: req.user.id,
      type: 'campaign.viewed',
      targetId: campaign.id,
      targetType: 'Campaign'
    });    

    res.status(200).json(campaign);
  } catch (error) {
    console.error('Get Campaign Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch campaign.' });
  }
};

// Update campaign
export const updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const campaign = await prisma.campaign.findUnique({ where: { id: Number(id) } });
    if (!campaign || campaign.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this campaign.' });
    }

  try {
    const updated = await prisma.campaign.update({
      where: { id: Number(id) },
      data: { name, description },
    });

    await logEvent({
      userId: req.user.id,
      type: 'campaign.updated',
      targetId: updated.id,
      targetType: 'Campaign',
      metadata: { name: updated.name }
    });    

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Campaign Error:', error.message);
    res.status(500).json({ message: 'Failed to update campaign.' });
  }
};

// Delete campaign
export const deleteCampaign = async (req, res) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.findUnique({ where: { id: Number(id) } });
if (!campaign || campaign.userId !== req.user.id) {
  return res.status(403).json({ message: 'Not authorized to delete this campaign.' });
}

  try {
    await prisma.campaign.delete({ where: { id: Number(id) } });

    await logEvent({
      userId: req.user.id,
      type: 'campaign.deleted',
      targetId: Number(id),
      targetType: 'Campaign'
    }); 

    res.status(204).send();
  } catch (error) {
    console.error('Delete Campaign Error:', error.message);
    res.status(500).json({ message: 'Failed to delete campaign.' });
  }
};

