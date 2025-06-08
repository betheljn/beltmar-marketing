import prisma from '../lib/prismaClient.js';
import { logEvent } from '../utils/logEvent.js';

// ===== CREATE CONTENT =====
export const createContent = async (req, res) => {
  const { campaignId, type, platform, content, scheduledAt } = req.body;
  const userId = req.user.id;
  const parsedCampaignId = Number(campaignId);

  if (isNaN(parsedCampaignId)) {
    return res.status(400).json({ message: 'Invalid campaignId' });
  }

  try {
    const created = await prisma.content.create({
      data: {
        campaignId: parsedCampaignId,
        userId,
        type,
        platform,
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      }
    });

    await logEvent({
      userId,
      type: 'content.created',
      targetId: created.id,
      targetType: 'Content',
      metadata: { type, platform }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('Create Content Error:', err.message);
    res.status(500).json({ message: 'Failed to create content.' });
  }
};


export const createContentWithFiles = async (req, res) => {
  const { campaignId, type, platform, content, scheduledAt } = req.body;
  const userId = req.user.id;
  const parsedCampaignId = Number(campaignId);

  if (isNaN(parsedCampaignId)) {
    return res.status(400).json({ message: 'Invalid campaignId' });
  }

  try {
    const newContent = await prisma.content.create({
      data: {
        campaignId: parsedCampaignId,
        userId,
        type,
        platform,
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      }
    });

    const files = req.files || [];
    const attachments = await Promise.all(
      files.map(file =>
        prisma.attachment.create({
          data: {
            contentId: newContent.id,
            url: `/uploads/${file.filename}`,
            type: file.mimetype.split('/')[0]
          }
        })
      )
    );

    await logEvent({
      userId,
      type: 'content.created_with_uploads',
      targetId: newContent.id,
      targetType: 'Content',
      metadata: { attachmentCount: attachments.length }
    });

    res.status(201).json({ content: newContent, attachments });
  } catch (err) {
    console.error('Upload Error:', err.message);
    res.status(500).json({ message: 'Failed to create content with attachments.' });
  }
};

// ===== GET CONTENT BY CAMPAIGN =====
export const getContentByCampaign = async (req, res) => {
  const { campaignId } = req.params;
  const { type, platform, skip = 0, take = 10 } = req.query;

  try {
    const contents = await prisma.content.findMany({
      where: {
        campaignId: Number(campaignId),
        ...(type && { type }),
        ...(platform && { platform }),
      },
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(take),
    });

    await logEvent({
      userId: req.user.id,
      type: 'content.viewed_list',
      targetType: 'Campaign',
      targetId: Number(campaignId),
      metadata: { count: contents.length }
    });

    res.status(200).json(contents);
  } catch (err) {
    console.error('Get Content Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch content.' });
  }
};

// ===== GET SINGLE CONTENT ITEM =====
export const getContent = async (req, res) => {
  const { id } = req.params;

  try {
    const content = await prisma.content.findUnique({
      where: { id: Number(id) },
      include: {
        attachments: true,
        comments: true,
      }
    });

    if (!content) return res.status(404).json({ message: 'Content not found.' });

    await logEvent({
      userId: req.user.id,
      type: 'content.viewed',
      targetId: content.id,
      targetType: 'Content'
    });

    res.status(200).json(content);
  } catch (err) {
    console.error('Get Content Error:', err.message);
    res.status(500).json({ message: 'Failed to fetch content.' });
  }
};

// ===== UPDATE CONTENT =====
export const updateContent = async (req, res) => {
  const { id } = req.params;
  const { type, platform, content, scheduledAt } = req.body;

  const existing = await prisma.content.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this content.' });
  }

  try {
    const updated = await prisma.content.update({
      where: { id: Number(id) },
      data: {
        type,
        platform,
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      }
    });

    await logEvent({
      userId: req.user.id,
      type: 'content.updated',
      targetId: updated.id,
      targetType: 'Content',
      metadata: { type: updated.type, platform: updated.platform }
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update Content Error:', err.message);
    res.status(500).json({ message: 'Failed to update content.' });
  }
};

// ===== DELETE CONTENT =====
export const deleteContent = async (req, res) => {
  const { id } = req.params;

  const content = await prisma.content.findUnique({ where: { id: Number(id) } });
  if (!content || content.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this content.' });
  }

  try {
    await prisma.content.delete({ where: { id: Number(id) } });

    await logEvent({
      userId: req.user.id,
      type: 'content.deleted',
      targetId: Number(id),
      targetType: 'Content'
    });

    res.status(204).send();
  } catch (err) {
    console.error('Delete Content Error:', err.message);
    res.status(500).json({ message: 'Failed to delete content.' });
  }
};