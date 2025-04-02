import { db } from '../../storage';
import { eq, desc, and } from 'drizzle-orm';
import { schema } from '../../../shared/schema';
import { Request, Response } from 'express';
import { generateId } from '../../utils';

// Get all trade signals
export const getAllTradeSignals = async (req: Request, res: Response) => {
  try {
    const signals = await db.query.tradeSignals.findMany({
      orderBy: [desc(schema.tradeSignals.timestamp)],
      limit: 50
    });
    
    return res.status(200).json(signals);
  } catch (error) {
    console.error('Error fetching trade signals:', error);
    return res.status(500).json({ error: 'Failed to fetch trade signals' });
  }
};

// Get trade signals by provider
export const getTradeSignalsByProvider = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    
    const signals = await db.query.tradeSignals.findMany({
      where: eq(schema.tradeSignals.providerId, providerId),
      orderBy: [desc(schema.tradeSignals.timestamp)],
      limit: 50
    });
    
    return res.status(200).json(signals);
  } catch (error) {
    console.error('Error fetching provider trade signals:', error);
    return res.status(500).json({ error: 'Failed to fetch provider trade signals' });
  }
};

// Create a new trade signal
export const createTradeSignal = async (req: Request, res: Response) => {
  try {
    const { 
      providerId, 
      symbol, 
      side, 
      entryPrice, 
      stopLoss, 
      takeProfit, 
      description 
    } = req.body;
    
    // Validate required fields
    if (!providerId || !symbol || !side) {
      return res.status(400).json({ 
        error: 'Missing required fields: providerId, symbol, and side are required' 
      });
    }
    
    // Validate side is either 'buy' or 'sell'
    if (side !== 'buy' && side !== 'sell') {
      return res.status(400).json({ 
        error: 'Side must be either "buy" or "sell"' 
      });
    }
    
    const newSignal = {
      id: generateId(),
      providerId,
      symbol,
      side,
      entryPrice: entryPrice || null,
      stopLoss: stopLoss || null,
      takeProfit: takeProfit || null,
      description: description || null,
      timestamp: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.insert(schema.tradeSignals).values(newSignal).returning();
    
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating trade signal:', error);
    return res.status(500).json({ error: 'Failed to create trade signal' });
  }
};

// Update a trade signal status (close or cancel)
export const updateTradeSignalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, closePrice, pnl } = req.body;
    
    // Validate status
    if (status !== 'active' && status !== 'closed' && status !== 'cancelled') {
      return res.status(400).json({ 
        error: 'Status must be "active", "closed", or "cancelled"' 
      });
    }
    
    // If status is closed, ensure closePrice is provided
    if (status === 'closed' && !closePrice) {
      return res.status(400).json({ 
        error: 'closePrice is required when closing a trade signal' 
      });
    }
    
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Add close-specific fields if status is closed
    if (status === 'closed') {
      updateData.closePrice = closePrice;
      updateData.pnl = pnl || 0;
      updateData.closedAt = new Date().toISOString();
    }
    
    const result = await db
      .update(schema.tradeSignals)
      .set(updateData)
      .where(eq(schema.tradeSignals.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Trade signal not found' });
    }
    
    return res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error updating trade signal:', error);
    return res.status(500).json({ error: 'Failed to update trade signal' });
  }
};

// Log a copy action
export const logCopyTradeSignal = async (req: Request, res: Response) => {
  try {
    const { signalId, autoExecute } = req.body;
    const userId = req.session?.userId || 'anonymous';
    
    // Verify the signal exists
    const signal = await db.query.tradeSignals.findFirst({
      where: eq(schema.tradeSignals.id, signalId)
    });
    
    if (!signal) {
      return res.status(404).json({ error: 'Trade signal not found' });
    }
    
    // Log the copy action
    const copyLog = {
      id: generateId(),
      userId,
      signalId,
      timestamp: new Date().toISOString(),
      autoExecute: autoExecute || false,
      executionStatus: autoExecute ? 'pending' : 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real implementation, this would insert to a copyTradeLog table
    // For now, just return success
    
    return res.status(200).json({ 
      success: true, 
      message: 'Copy action logged successfully',
      copyDetails: copyLog
    });
  } catch (error) {
    console.error('Error logging copy trade action:', error);
    return res.status(500).json({ error: 'Failed to log copy trade action' });
  }
};