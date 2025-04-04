import express from 'express';
import { db } from '../db';
import { 
  investments, 
  investmentPerformance, 
  companyRevenue, 
  feeSettings, 
  investors,
  insertInvestmentPerformanceSchema 
} from '../../shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

const router = express.Router();

// Expose functions for direct import in routes.ts
export const getInvestmentPerformance = async (req: express.Request, res: express.Response) => {
  try {
    console.log('Fetching investment performance with query params:', req.query);
    
    // Filter by investor ID if provided
    if (req.query.investorId) {
      try {
        const investorId = parseInt(req.query.investorId as string);
        
        // First get investment IDs for this investor
        const investmentsForInvestor = await db
          .select({ id: investments.id })
          .from(investments)
          .where(eq(investments.investorId, investorId));
        
        const investmentIds = investmentsForInvestor.map(inv => inv.id);
        
        if (investmentIds.length === 0) {
          // No investments found for this investor
          return res.json([]);
        }
        
        // Get performance records for these investments
        let performanceRecords;
        if (investmentIds.length === 1) {
          performanceRecords = await db
            .select()
            .from(investmentPerformance)
            .where(eq(investmentPerformance.investmentId, investmentIds[0]))
            .orderBy(desc(investmentPerformance.period));
        } else {
          performanceRecords = await db
            .select()
            .from(investmentPerformance)
            .where(inArray(investmentPerformance.investmentId, investmentIds))
            .orderBy(desc(investmentPerformance.period));
        }
        
        // Return the records
        return res.json(performanceRecords);
      } catch (error) {
        console.error('Error processing investor performance:', error);
        return res.status(500).json({ error: 'Failed to fetch investor performance records' });
      }
    }
    
    // Filter by investment ID if provided
    if (req.query.investmentId) {
      try {
        const investmentId = parseInt(req.query.investmentId as string);
        
        const performanceRecords = await db
          .select()
          .from(investmentPerformance)
          .where(eq(investmentPerformance.investmentId, investmentId))
          .orderBy(desc(investmentPerformance.period));
          
        return res.json(performanceRecords);
      } catch (error) {
        console.error('Error fetching investment performance:', error);
        return res.status(500).json({ error: 'Failed to fetch investment performance records' });
      }
    }
    
    // Filter by period if provided
    if (req.query.period) {
      try {
        const period = req.query.period as string;
        
        const performanceRecords = await db
          .select()
          .from(investmentPerformance)
          .where(eq(investmentPerformance.period, period))
          .orderBy(desc(investmentPerformance.period));
          
        return res.json(performanceRecords);
      } catch (error) {
        console.error('Error fetching period performance:', error);
        return res.status(500).json({ error: 'Failed to fetch period performance records' });
      }
    }
    
    // No filters, return all records
    try {
      const performanceRecords = await db
        .select()
        .from(investmentPerformance)
        .orderBy(desc(investmentPerformance.period));
      
      // Return the real data from database
      return res.json(performanceRecords);
    } catch (error) {
      console.error('Error fetching all performance records:', error);
      return res.status(500).json({ error: 'Failed to fetch performance records' });
    }
  } catch (error) {
    console.error('Error in getInvestmentPerformance:', error);
    res.status(500).json({ error: 'Failed to fetch performance records' });
  }
};

export const getInvestmentPerformanceByPeriod = async (req: express.Request, res: express.Response) => {
  const { period } = req.params;
  
  try {
    const performanceRecords = await db
      .select()
      .from(investmentPerformance)
      .where(eq(investmentPerformance.period, period));
    
    res.json(performanceRecords);
  } catch (error) {
    console.error(`Error fetching performance records for period ${period}:`, error);
    res.status(500).json({ error: 'Failed to fetch performance records' });
  }
};

export const getInvestorPerformance = async (req: express.Request, res: express.Response) => {
  const { investorId } = req.params;
  
  try {
    // Get all investments for the investor
    const investorInvestments = await db
      .select({ id: investments.id })
      .from(investments)
      .where(eq(investments.investorId, parseInt(investorId)));
    
    const investmentIds = investorInvestments.map(inv => inv.id);
    
    if (investmentIds.length === 0) {
      return res.json([]);
    }
    
    let performanceRecords: any[] = [];
    
    // Process each investment ID separately to avoid type errors
    for (const invId of investmentIds) {
      const records = await db
        .select()
        .from(investmentPerformance)
        .where(eq(investmentPerformance.investmentId, invId));
        
      performanceRecords = [...performanceRecords, ...records];
    }
    
    // Sort all records by period descending
    performanceRecords.sort((a, b) => {
      if (a.period < b.period) return 1;
      if (a.period > b.period) return -1;
      return 0;
    });
    
    res.json(performanceRecords);
  } catch (error) {
    console.error(`Error fetching performance records for investor ${investorId}:`, error);
    res.status(500).json({ error: 'Failed to fetch investor performance records' });
  }
};

export const recordPerformance = async (req: express.Request, res: express.Response) => {
  try {
    // Parse and validate input
    const performanceData = insertInvestmentPerformanceSchema.parse({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert performance record
    const [newRecord] = await db.insert(investmentPerformance).values(performanceData).returning();
    
    // Update investment current balance
    await db
      .update(investments)
      .set({ 
        currentBalance: performanceData.endBalance,
        updatedAt: new Date() 
      })
      .where(eq(investments.id, performanceData.investmentId));
    
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating performance record:', error);
    res.status(400).json({ error: 'Failed to create performance record' });
  }
};

export const generatePerformanceReport = async (req: express.Request, res: express.Response) => {
  const { period } = req.body;
  
  if (!period) {
    return res.status(400).json({ error: 'Period is required' });
  }
  
  try {
    // Get performance records without generated reports
    const pendingRecords = await db
      .select()
      .from(investmentPerformance)
      .where(
        and(
          eq(investmentPerformance.period, period),
          eq(investmentPerformance.reportGenerated, false)
        )
      );
    
    if (pendingRecords.length === 0) {
      return res.status(404).json({ error: 'No pending reports to generate' });
    }
    
    // Update each record with a "generated" report URL
    const updatedRecords = [];
    
    for (const record of pendingRecords) {
      // In a real system, this would generate a PDF report and store it,
      // but here we'll just create a placeholder URL
      const reportUrl = `/reports/${record.investmentId}_${record.period.replace('-', '_')}.pdf`;
      
      // Update the record
      const [updatedRecord] = await db
        .update(investmentPerformance)
        .set({
          reportGenerated: true,
          reportUrl: reportUrl,
          updatedAt: new Date()
        })
        .where(eq(investmentPerformance.id, record.id))
        .returning();
      
      updatedRecords.push(updatedRecord);
    }
    
    res.json({
      message: `Generated ${updatedRecords.length} reports`,
      reports: updatedRecords
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
};

export const updatePerformanceReport = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
  try {
    const [updatedRecord] = await db
      .update(investmentPerformance)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(investmentPerformance.id, parseInt(id)))
      .returning();
    
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Performance record not found' });
    }
    
    res.json(updatedRecord);
  } catch (error) {
    console.error(`Error updating performance record with ID ${id}:`, error);
    res.status(400).json({ error: 'Failed to update performance record' });
  }
};

// Register routes to use the exported functions
router.get('/', getInvestmentPerformance);
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const performanceRecord = await db
      .select()
      .from(investmentPerformance)
      .where(eq(investmentPerformance.id, parseInt(id)))
      .limit(1);
    
    if (performanceRecord.length === 0) {
      return res.status(404).json({ error: 'Performance record not found' });
    }
    
    res.json(performanceRecord[0]);
  } catch (error) {
    console.error(`Error fetching performance record with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch performance record' });
  }
});
router.post('/', recordPerformance);

// Function for updating all investments' performance at once
export const updateAllInvestmentsPerformance = async (req: express.Request, res: express.Response) => {
  const { percentReturn, period } = req.body;
  
  if (!percentReturn || !period) {
    return res.status(400).json({ error: 'Percentage return and period are required' });
  }
  
  try {
    // Get active investments
    const activeInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.status, 'active'));
    
    if (activeInvestments.length === 0) {
      return res.status(404).json({ error: 'No active investments found' });
    }
    
    // Get fee settings
    const feeSettingsData = await db
      .select()
      .from(feeSettings)
      .where(eq(feeSettings.isActive, true))
      .limit(1);
    
    const feeSetting = feeSettingsData[0] || {
      defaultPerformanceFeePercent: 20,
      defaultBrokerProcessingFeePercent: 0.5,
      defaultBrokerProcessingFeeFlat: 10
    };
    
    // Performance records to be created
    const performanceRecords = [];
    
    // Company revenue tracking
    let totalPerformanceFeeRevenue = 0;
    let totalSetupFeeRevenue = 0;
    let totalBrokerProcessingFeeRevenue = 0;
    let totalAssetsUnderManagement = 0;
    
    // Process each investment
    for (const investment of activeInvestments) {
      // Calculate new balance and profit
      const startBalance = investment.currentBalance;
      const grossProfit = startBalance * (percentReturn / 100);
      const endBalance = startBalance + grossProfit;
      
      // Calculate fees
      const performanceFeePercent = investment.performanceFeePercent || feeSetting.defaultPerformanceFeePercent || 20;
      const performanceFee = grossProfit > 0 
        ? grossProfit * (performanceFeePercent / 100) 
        : 0;
      
      // Setup fee is only applied on the first performance record
      const existingRecords = await db
        .select()
        .from(investmentPerformance)
        .where(eq(investmentPerformance.investmentId, investment.id));
      
      const setupFee = existingRecords.length === 0 ? (investment.setupFee || 0) : 0;
      
      // Calculate broker processing fee
      const brokerProcessingFeePercent = grossProfit > 0 
        ? grossProfit * (feeSetting.defaultBrokerProcessingFeePercent / 100)
        : 0;
      
      const brokerProcessingFee = brokerProcessingFeePercent + feeSetting.defaultBrokerProcessingFeeFlat;
      
      // Calculate net profit
      const totalFees = performanceFee + setupFee + brokerProcessingFee;
      const netProfit = grossProfit - totalFees;
      
      // Create performance record
      const performanceRecord = {
        investmentId: investment.id,
        period,
        startBalance: startBalance,
        endBalance: endBalance,
        percentReturn: percentReturn,
        grossProfit: grossProfit,
        performanceFee: performanceFee,
        setupFee: setupFee,
        brokerProcessingFee: brokerProcessingFee,
        otherFees: 0,
        netProfit: netProfit,
        reportGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert performance record
      const [newRecord] = await db.insert(investmentPerformance).values(performanceRecord).returning();
      performanceRecords.push(newRecord);
      
      // Update investment current balance
      await db
        .update(investments)
        .set({ 
          currentBalance: endBalance,
          updatedAt: new Date() 
        })
        .where(eq(investments.id, investment.id));
      
      // Track company revenue
      totalPerformanceFeeRevenue += performanceFee;
      totalSetupFeeRevenue += setupFee;
      totalBrokerProcessingFeeRevenue += brokerProcessingFee;
      totalAssetsUnderManagement += endBalance;
    }
    
    // Update or create company revenue record for this period
    const existingRevenue = await db
      .select()
      .from(companyRevenue)
      .where(eq(companyRevenue.period, period))
      .limit(1);
    
    const totalInvestorCount = await db
      .select({ count: investors.id })
      .from(investors)
      .where(eq(investors.status, 'active'));
    
    if (existingRevenue.length > 0) {
      // Update existing revenue record
      await db
        .update(companyRevenue)
        .set({
          performanceFeeRevenue: totalPerformanceFeeRevenue,
          setupFeeRevenue: totalSetupFeeRevenue,
          brokerProcessingFeeRevenue: totalBrokerProcessingFeeRevenue,
          totalRevenue: totalPerformanceFeeRevenue + totalSetupFeeRevenue + totalBrokerProcessingFeeRevenue,
          totalInvestorCount: totalInvestorCount.length,
          totalAssetsUnderManagement: totalAssetsUnderManagement,
          updatedAt: new Date()
        })
        .where(eq(companyRevenue.id, existingRevenue[0].id));
    } else {
      // Create new revenue record
      await db
        .insert(companyRevenue)
        .values({
          period,
          performanceFeeRevenue: totalPerformanceFeeRevenue,
          setupFeeRevenue: totalSetupFeeRevenue,
          brokerProcessingFeeRevenue: totalBrokerProcessingFeeRevenue,
          totalRevenue: totalPerformanceFeeRevenue + totalSetupFeeRevenue + totalBrokerProcessingFeeRevenue,
          totalInvestorCount: totalInvestorCount.length,
          totalAssetsUnderManagement: totalAssetsUnderManagement,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    res.json({
      message: `Updated performance for ${performanceRecords.length} investments`,
      records: performanceRecords
    });
  } catch (error) {
    console.error('Error updating investments performance:', error);
    res.status(500).json({ error: 'Failed to update investments performance' });
  }
};

// Add bulk update route
router.post('/bulk-update', updateAllInvestmentsPerformance);

// Add route for generating reports
router.post('/generate-reports', generatePerformanceReport);

// Register the router
export default router;