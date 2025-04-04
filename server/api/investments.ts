import express from 'express';
import { db } from '../db';
import { investments, investors, insertInvestmentSchema } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Expose functions for direct import in routes.ts
export const getAllInvestments = async (req: express.Request, res: express.Response) => {
  try {
    console.log('Fetching investments with query params:', req.query);
    
    // Return mock data
    const mockInvestments = [
      {
        id: 1,
        investorId: 1,
        name: "Personal Trading Account",
        type: "personal",
        initialDeposit: 50000,
        currentBalance: 58750,
        depositDate: new Date('2023-02-10'),
        performanceFee: 20,
        managementFee: 2,
        status: "active",
        notes: "Main trading account for forex and crypto",
        createdAt: new Date('2023-02-10'),
        updatedAt: new Date(),
        investor: {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com"
        }
      },
      {
        id: 2,
        investorId: 1,
        name: "FTMO Challenge Account",
        type: "prop_firm_management",
        initialDeposit: 100000,
        currentBalance: 112500,
        depositDate: new Date('2023-03-15'),
        performanceFee: 20,
        managementFee: 2,
        status: "active",
        notes: "FTMO prop firm account with 10% profit target",
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date(),
        investor: {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com"
        }
      },
      {
        id: 3,
        investorId: 1,
        name: "Hybrid Fund Allocation",
        type: "hybrid_fund",
        initialDeposit: 100000,
        currentBalance: 108000,
        depositDate: new Date('2023-04-20'),
        performanceFee: 20,
        managementFee: 2,
        status: "active",
        notes: "Allocation in the TradeHybrid fund",
        createdAt: new Date('2023-04-20'),
        updatedAt: new Date(),
        investor: {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com"
        }
      }
    ];
    
    // Filter investments based on query parameters
    let filteredInvestments = [...mockInvestments];
    
    // Filter by investor ID
    if (req.query.investorId) {
      const investorId = parseInt(req.query.investorId as string);
      filteredInvestments = filteredInvestments.filter(inv => inv.investorId === investorId);
    }
    
    // Filter by status
    if (req.query.status) {
      const status = req.query.status as string;
      filteredInvestments = filteredInvestments.filter(inv => inv.status === status);
    }
    
    // Filter by type
    if (req.query.type) {
      const type = req.query.type as string;
      filteredInvestments = filteredInvestments.filter(inv => inv.type === type);
    }
    
    res.json(filteredInvestments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
};

export const getInvestmentById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
  try {
    const investment = await db
      .select()
      .from(investments)
      .where(eq(investments.id, parseInt(id)))
      .limit(1);
    
    if (investment.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Fetch investor data
    const investor = await db
      .select()
      .from(investors)
      .where(eq(investors.id, investment[0].investorId))
      .limit(1);
    
    // Return investment with investor data
    res.json({
      ...investment[0],
      investor: investor[0] || null
    });
  } catch (error) {
    console.error(`Error fetching investment with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
};

export const getInvestmentsByInvestorId = async (req: express.Request, res: express.Response) => {
  const { investorId } = req.params;
  
  try {
    const investorInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, parseInt(investorId)));
    
    res.json(investorInvestments);
  } catch (error) {
    console.error(`Error fetching investments for investor ${investorId}:`, error);
    res.status(500).json({ error: 'Failed to fetch investments for investor' });
  }
};

export const createInvestment = async (req: express.Request, res: express.Response) => {
  try {
    // Parse and validate input
    const investmentData = insertInvestmentSchema.parse({
      ...req.body,
      currentBalance: req.body.initialDeposit, // Initially set current balance to initial deposit
      depositDate: new Date(req.body.depositDate),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert investment record
    const [newInvestment] = await db.insert(investments).values(investmentData).returning();
    
    // Fetch and include investor data
    const investor = await db
      .select()
      .from(investors)
      .where(eq(investors.id, newInvestment.investorId))
      .limit(1);
    
    res.status(201).json({
      ...newInvestment,
      investor: investor[0] || null
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(400).json({ error: 'Failed to create investment' });
  }
};

export const updateInvestment = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
  try {
    // Prepare investment data for update
    const investmentData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // Update investment record
    const [updatedInvestment] = await db
      .update(investments)
      .set(investmentData)
      .where(eq(investments.id, parseInt(id)))
      .returning();
    
    if (!updatedInvestment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Fetch and include investor data
    const investor = await db
      .select()
      .from(investors)
      .where(eq(investors.id, updatedInvestment.investorId))
      .limit(1);
    
    res.json({
      ...updatedInvestment,
      investor: investor[0] || null
    });
  } catch (error) {
    console.error(`Error updating investment with ID ${id}:`, error);
    res.status(400).json({ error: 'Failed to update investment' });
  }
};

export const deleteInvestment = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
  try {
    const [deletedInvestment] = await db
      .delete(investments)
      .where(eq(investments.id, parseInt(id)))
      .returning();
    
    if (!deletedInvestment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting investment with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
};

// Routes using the exported handlers
router.get('/', getAllInvestments);
router.get('/:id', getInvestmentById);
router.post('/', createInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

// Add a route for getting investments by investor ID
router.get('/investor/:investorId', getInvestmentsByInvestorId);

export default router;