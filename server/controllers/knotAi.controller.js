import prisma from '../lib/prismaClient.js';

export const getKnotAISettings = async (req, res) => {
  try {
    const { knotId } = req.params;
    const settings = await prisma.knotAISetting.findUnique({
      where: { knotId: Number(knotId) }
    });

    res.json(settings || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Knot AI settings' });
  }
};

export const updateKnotAISettings = async (req, res) => {
  try {
    const { knotId } = req.params;
    const { assistantName, tone, summaryFreq, moderation } = req.body;

    const updated = await prisma.knotAISetting.upsert({
      where: { knotId: Number(knotId) },
      update: { assistantName, tone, summaryFreq, moderation },
      create: {
        knotId: Number(knotId),
        assistantName,
        tone,
        summaryFreq,
        moderation
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update Knot AI settings' });
  }
};
