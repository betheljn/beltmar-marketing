import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prismaClient.js';

// Add performance data to a campaign
export const addPerformance = async (req, res) => {
  const { campaignId, impressions, clicks, conversions, engagement } = req.body;

  try {
    // Check that campaign exists
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    const performance = await prisma.performance.create({
      data: {
        campaignId,
        impressions,
        clicks,
        conversions,
        engagement,
      },
    });

    res.status(201).json(performance);
  } catch (error) {
    console.error('Add Performance Error:', error.message);
    res.status(500).json({ message: 'Failed to add performance.' });
  }
};

// Get all performance entries for a campaign with calculated fields
export const getPerformanceByCampaign = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const records = await prisma.performance.findMany({
      where: { campaignId: Number(campaignId) },
      orderBy: { createdAt: 'desc' },
    });

    // Add calculated fields like CTR, conversion rate
    const enriched = records.map(p => {
      const ctr = p.impressions ? (p.clicks / p.impressions) * 100 : 0;
      const conversionRate = p.clicks ? (p.conversions / p.clicks) * 100 : 0;

      return {
        ...p,
        ctr: Number(ctr.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Fetch Performance Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch performance.' });
  }
};

// Delete a specific performance record
export const deletePerformance = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.performance.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete Performance Error:', error.message);
    res.status(500).json({ message: 'Failed to delete performance.' });
  }
};

export const getPerformanceSummaryByCampaign = async (req, res) => {
    const { campaignId } = req.params;
  
    try {
      const records = await prisma.performance.findMany({
        where: { campaignId: Number(campaignId) },
      });
  
      if (records.length === 0) return res.status(404).json({ message: 'No performance data found.' });
  
      const totalImpressions = records.reduce((sum, r) => sum + r.impressions, 0);
      const totalClicks = records.reduce((sum, r) => sum + r.clicks, 0);
      const totalConversions = records.reduce((sum, r) => sum + r.conversions, 0);
      const avgEngagement = records.reduce((sum, r) => sum + r.engagement, 0) / records.length;
  
      const avgCTR = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;
      const avgConversionRate = totalClicks ? (totalConversions / totalClicks) * 100 : 0;
  
      const bestEntry = records.reduce((best, r) =>
        !best || (r.clicks > best.clicks && r.engagement > best.engagement) ? r : best, null);
  
      res.status(200).json({
        campaignId: Number(campaignId),
        totalImpressions,
        totalClicks,
        totalConversions,
        avgEngagement: Number(avgEngagement.toFixed(2)),
        avgCTR: Number(avgCTR.toFixed(2)),
        avgConversionRate: Number(avgConversionRate.toFixed(2)),
        bestEntry,
      });
    } catch (error) {
      console.error('Performance Summary Error:', error.message);
      res.status(500).json({ message: 'Failed to fetch summary.' });
    }
  };

