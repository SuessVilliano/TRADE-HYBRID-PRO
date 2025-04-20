import express from 'express';
import { db } from '../db';
import { investors, investments, insertInvestorSchema } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Expose functions for direct import in routes.ts
export const getAllInvestors = async (req: express.Request, res: express.Response) => {
  try {
    const allInvestors = await db.select().from(investors);
    res.json(allInvestors);
  } catch (error) {
    console.error('Error fetching investors:', error);
    res.status(500).json({ error: 'Failed to fetch investors' });
  }
};

export const getInvestorById = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
  try {
    const investor = await db.select().from(investors).where(eq(investors.id, parseInt(id))).limit(1);
    
    if (investor.length === 0) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    res.json(investor[0]);
  } catch (error) {
    console.error(`Error fetching investor with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch investor' });
  }
};

export const createInvestor = async (req: express.Request, res: express.Response) => {
  try {
    // Parse and validate input
    const investorData = insertInvestorSchema.parse({
      ...req.body,
      joinDate: req.body.joinDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert investor record
    const [newInvestor] = await db.insert(investors).values(investorData).returning();
    
    res.status(201).json(newInvestor);
  } catch (error) {
    console.error('Error creating investor:', error);
    res.status(400).json({ error: 'Failed to create investor' });
  }
};

export const updateInvestor = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
  try {
    // Parse and validate input
    const investorData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // Update investor record
    const [updatedInvestor] = await db
      .update(investors)
      .set(investorData)
      .where(eq(investors.id, parseInt(id)))
      .returning();
    
    if (!updatedInvestor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    res.json(updatedInvestor);
  } catch (error) {
    console.error(`Error updating investor with ID ${id}:`, error);
    res.status(400).json({ error: 'Failed to update investor' });
  }
};

export const deleteInvestor = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  
  try {
    const [deletedInvestor] = await db
      .delete(investors)
      .where(eq(investors.id, parseInt(id)))
      .returning();
    
    if (!deletedInvestor) {
      return res.status(404).json({ error: 'Investor not found' });
    }
    
    res.json({ message: 'Investor deleted successfully' });
  } catch (error) {
    console.error(`Error deleting investor with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete investor' });
  }
};

// Get investor profile for current user
router.get('/me', async (req, res) => {
  try {
    console.log('Fetching investor profile for current user');
    
    // Get user ID from the session if authenticated
    const userId = (req.session as any)?.user?.id;
    
    // Check if user is authenticated
    if (!userId) {
      console.log('User not authenticated, returning 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    console.log(`Looking up investor profile for user ID: ${userId}`);
    
    // Look up investor by user ID
    const investor = await db
      .select()
      .from(investors)
      .where(eq(investors.userId, userId))
      .limit(1);
    
    if (investor.length === 0) {
      console.log(`No investor profile found for user ID: ${userId}`);
      return res.status(404).json({ error: 'No investor profile found for this user' });
    }
    
    console.log(`Found investor profile: ${investor[0].id} for user ID: ${userId}`);
    
    // Calculate total invested amount
    const investorInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, investor[0].id));
    
    const totalInvested = investorInvestments.reduce(
      (sum, inv) => sum + (inv.initialDeposit || 0), 
      0
    );
    
    console.log(`Returning investor data with ${investorInvestments.length} investments`);
    
    // Return investor data with calculated fields
    res.json({
      ...investor[0],
      totalInvested
    });
  } catch (error) {
    console.error('Error fetching investor profile:', error);
    res.status(500).json({ error: 'Failed to fetch investor profile' });
  }
});

// Get all investors
router.get('/', getAllInvestors);

// Get investor by ID
router.get('/:id', getInvestorById);

// Create a new investor
router.post('/', createInvestor);

// Update an investor
router.put('/:id', updateInvestor);

// Delete an investor
router.delete('/:id', deleteInvestor);

export default router;