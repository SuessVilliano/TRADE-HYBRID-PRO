import express from 'express';
import { db } from '../db';
import { investments, investors, insertInvestmentSchema } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Expose functions for direct import in routes.ts
export const getAllInvestments = async (req: express.Request, res: express.Response) => {
  try {
    console.log('Fetching investments with query params:', req.query);
    
    // Build query conditions based on filters
    let query = db.select({
      investment: investments,
      investor: investors
    })
    .from(investments)
    .leftJoin(investors, eq(investments.investorId, investors.id));
    
    // Apply filters
    const whereConditions = [];
    
    // Filter by investor ID
    if (req.query.investorId) {
      const investorId = parseInt(req.query.investorId as string);
      whereConditions.push(eq(investments.investorId, investorId));
    }
    
    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      const status = req.query.status as string;
      whereConditions.push(eq(investments.status, status));
    }
    
    // Filter by type
    if (req.query.type && req.query.type !== 'all') {
      const type = req.query.type as string;
      whereConditions.push(eq(investments.type, type as any));
    }
    
    // Apply all conditions if any exist
    if (whereConditions.length > 0) {
      // Use type assertion to help TypeScript understand this is a valid operation
      // Type system struggles with complex query builders sometimes
      (query as any) = query.where(and(...whereConditions));
    }
    
    // Execute the query
    const results = await query;
    
    // Format the results to match the expected response structure
    const formattedInvestments = results.map(result => ({
      ...result.investment,
      investor: result.investor ? {
        id: result.investor.id,
        name: result.investor.name,
        email: result.investor.email
      } : null
    }));
    
    res.json(formattedInvestments);
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
// Add auth middleware to protect all investment routes
// First, define specific routes before generic /:id route to prevent interception
router.get('/investor/:investorId', authMiddleware, getInvestmentsByInvestorId);

// Then define the other routes
router.get('/', authMiddleware, getAllInvestments);
router.get('/:id', authMiddleware, getInvestmentById);
router.post('/', authMiddleware, createInvestment);
router.put('/:id', authMiddleware, updateInvestment);
router.delete('/:id', authMiddleware, deleteInvestment);

export default router;