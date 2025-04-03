import express from 'express';
import { db } from '../db';
import { companyRevenue } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

// Get company revenue data
router.get('/', async (req, res) => {
  try {
    // Check if specific period is requested
    if (req.query.period) {
      const periodRevenue = await db
        .select()
        .from(companyRevenue)
        .where(eq(companyRevenue.period, req.query.period as string))
        .limit(1);
      
      if (periodRevenue.length === 0) {
        return res.status(404).json({ error: 'No revenue data found for the specified period' });
      }
      
      return res.json(periodRevenue[0]);
    }
    
    // Get the latest revenue data
    const latestRevenue = await db
      .select()
      .from(companyRevenue)
      .orderBy(desc(companyRevenue.period))
      .limit(1);
    
    if (latestRevenue.length === 0) {
      return res.status(404).json({ error: 'No revenue data found' });
    }
    
    res.json(latestRevenue[0]);
  } catch (error) {
    console.error('Error fetching company revenue:', error);
    res.status(500).json({ error: 'Failed to fetch company revenue data' });
  }
});

// Get company revenue history
router.get('/history', async (req, res) => {
  try {
    // Get revenue data for all periods
    const revenueHistory = await db
      .select()
      .from(companyRevenue)
      .orderBy(desc(companyRevenue.period));
    
    // Calculate revenue growth
    const revenueWithGrowth = revenueHistory.map((current, index, array) => {
      if (index === array.length - 1) {
        // First entry, no previous data for comparison
        return {
          ...current,
          revenueGrowth: 0
        };
      }
      
      const previous = array[index + 1];
      const revenueGrowth = previous.totalRevenue > 0
        ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100
        : 0;
      
      return {
        ...current,
        revenueGrowth
      };
    });
    
    res.json(revenueWithGrowth);
  } catch (error) {
    console.error('Error fetching company revenue history:', error);
    res.status(500).json({ error: 'Failed to fetch company revenue history' });
  }
});

// Get company revenue summary statistics
router.get('/summary', async (req, res) => {
  try {
    // Get all revenue records
    const allRevenue = await db
      .select()
      .from(companyRevenue);
    
    if (allRevenue.length === 0) {
      return res.status(404).json({ error: 'No revenue data found' });
    }
    
    // Calculate summary statistics
    const totalRevenue = allRevenue.reduce((sum, record) => sum + record.totalRevenue, 0);
    const performanceFeeRevenue = allRevenue.reduce((sum, record) => sum + record.performanceFeeRevenue, 0);
    const setupFeeRevenue = allRevenue.reduce((sum, record) => sum + record.setupFeeRevenue, 0);
    const brokerProcessingFeeRevenue = allRevenue.reduce((sum, record) => sum + record.brokerProcessingFeeRevenue, 0);
    const otherFeeRevenue = allRevenue.reduce((sum, record) => sum + record.otherFeeRevenue, 0);
    
    // Get the latest AUM
    const latestRecord = allRevenue.sort((a, b) => 
      new Date(b.period).getTime() - new Date(a.period).getTime()
    )[0];
    
    const summary = {
      totalRevenue,
      performanceFeeRevenue,
      setupFeeRevenue,
      brokerProcessingFeeRevenue,
      otherFeeRevenue,
      totalPeriods: allRevenue.length,
      latestAUM: latestRecord.totalAssetsUnderManagement,
      latestInvestorCount: latestRecord.totalInvestorCount,
      averageMonthlyRevenue: totalRevenue / allRevenue.length
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({ error: 'Failed to fetch revenue summary data' });
  }
});

export default router;