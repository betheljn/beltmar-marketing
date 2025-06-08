// server/controllers/comment.controller.js
import prisma from '../lib/prismaClient.js';
import { logEvent } from '../utils/logEvent.js';
import { notifyUser } from '../utils/notifyUser.js';



export const createComment = async (req, res) => {
  const { contentId, parentId, text } = req.body;
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.create({
      data: {
        contentId: Number(contentId),
        userId,
        parentId: parentId ? Number(parentId) : null,
        text
      }
    });

    await logEvent({
      userId,
      type: 'comment.created',
      targetId: comment.id,
      targetType: 'Comment'
    });

    await notifyUser({
      prisma,
      io,
      userId: someOtherUserId, // recipient
      type: 'comment.reply',
      message: `You received a reply: "${text}"`,
      targetId: comment.id,
      targetType: 'Comment'
    });

    const io = req.app.get('io');

    io.emit('receive-comment', {
      id: comment.id,
      text: comment.text,
      userId: comment.userId,
      contentId: comment.contentId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      attachments // if present
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error('Create Comment Error:', err.message);
    res.status(500).json({ message: 'Failed to create comment.' });
  }
};

export const createCommentWithAttachments = async (req, res) => {
    const { contentId, parentId, text } = req.body;
    const userId = req.user.id;
  
    if (!contentId || !text) {
      return res.status(400).json({ message: 'Missing required comment fields' });
    }
  
    try {
      const comment = await prisma.comment.create({
        data: {
          contentId: Number(contentId),
          parentId: parentId ? Number(parentId) : null,
          userId,
          text
        }
      });
  
      const files = req.files || [];
      const attachments = await Promise.all(
        files.map(file =>
          prisma.attachment.create({
            data: {
              commentId: comment.id,
              url: `/uploads/${file.filename}`,
              type: file.mimetype.split('/')[0]
            }
          })
        )
      );
  
      await logEvent({
        userId,
        type: 'comment.created_with_attachments',
        targetId: comment.id,
        targetType: 'Comment',
        metadata: { attachmentCount: attachments.length }
      });

      const io = req.app.get('io');
        io.emit('receive-comment', { comment, attachments });

  
      res.status(201).json({ comment, attachments });
    } catch (err) {
      console.error('Create Comment Error:', err.message);
      res.status(500).json({ message: 'Failed to create comment.' });
    }
  };

  export const getCommentsByContent = async (req, res) => {
    const { contentId } = req.params;
  
    try {
      const comments = await prisma.comment.findMany({
        where: { contentId: Number(contentId), parentId: null },
        include: {
          replies: {
            include: {
              attachments: true,
              user: true
            }
          },
          attachments: true,
          user: true
        },
        orderBy: { createdAt: 'desc' }
      });
  
      res.status(200).json(comments);
    } catch (err) {
      console.error('Get Comments Error:', err.message);
      res.status(500).json({ message: 'Failed to fetch comments.' });
    }
  };  

export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.findUnique({ where: { id: Number(id) } });
    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment.' });
    }

    const updated = await prisma.comment.update({
      where: { id: Number(id) },
      data: { text }
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update Comment Error:', err.message);
    res.status(500).json({ message: 'Failed to update comment.' });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.findUnique({ where: { id: Number(id) } });
    if (!comment || comment.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await prisma.comment.delete({ where: { id: Number(id) } });

    res.status(204).send();
  } catch (err) {
    console.error('Delete Comment Error:', err.message);
    res.status(500).json({ message: 'Failed to delete comment.' });
  }
};

export const replyToComment = async (req, res) => {
  const { parentId } = req.params;
  const { contentId, text } = req.body;
  const userId = req.user.id;

  if (!text || !contentId) {
    return res.status(400).json({ message: 'Missing text or contentId' });
  }

  try {
    const parentComment = await prisma.comment.findUnique({
      where: { id: Number(parentId) },
      select: { userId: true }
    });

    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found.' });
    }

    const reply = await prisma.comment.create({
      data: {
        contentId: Number(contentId),
        userId,
        parentId: Number(parentId),
        text
      }
    });

    await logEvent({
      userId,
      type: 'comment.replied',
      targetId: reply.id,
      targetType: 'Comment',
      metadata: { parentId: Number(parentId) }
    });

    // Notify original commenter (if not replying to your own comment)
    if (parentComment.userId !== userId) {
      const io = req.app.get('io');

      await notifyUser({
        prisma,
        io,
        userId: parentComment.userId,
        type: 'comment.reply',
        message: `Someone replied to your comment: "${text}"`,
        targetId: reply.id,
        targetType: 'Comment'
      });
    }

    res.status(201).json(reply);
  } catch (err) {
    console.error('Reply Error:', err.message);
    res.status(500).json({ message: 'Failed to reply to comment.' });
  }
};
