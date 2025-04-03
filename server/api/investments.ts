import express from 'express';
import { db } from '../db';
import { investments, investors, insertInvestmentSchema } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Expose functions for direct import in routes.ts
export const getAllInvestments = async (req: express.Request, res: express.Response) => {
  try {
    let query = db.select().from(investments);
    
    // Filter by investor ID if provided
    if (req.query.investorId) {
      query = query.where(eq(investments.investorId, parseInt(req.query.investorId as string)));
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query = query.where(eq(investments.status, req.query.status as string));
    }
    
    // Filter by type if provided
    if (req.query.type) {
      query = query.where(eq(investments.type, req.query.type as string));
    }
    
    const allInvestments = await query;
    
    // Fetch additional investor data for each investment
    const investmentsWithInvestors = await Promise.all(
      allInvestments.map(async (investment) => {
        const investor = await db
          .select()
          .from(investors)
          .where(eq(investors.id, investment.investorId))
          .limit(1);
        
        return {
          ...investment,
          investor: investor[0] || null
        };
      })
    );
    
    res.json(investmentsWithInvestors);
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