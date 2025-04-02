import { Request, Response } from 'express';
import { generateId, formatDate } from '../../utils';

// Sample trade signals data
const sampleTradeSignals = [
  {
    id: "signal-1",
    providerId: "provider-1",
    symbol: "BTC/USDT",
    side: "buy",
    entryPrice: 65000,
    stopLoss: 63000,
    takeProfit: 68000,
    description: "Strong bullish pattern on 4h chart",
    timestamp: formatDate(new Date(Date.now() - 3600000)),
    status: "active",
    createdAt: formatDate(new Date(Date.now() - 3600000)),
    updatedAt: formatDate(new Date(Date.now() - 3600000))
  },
  {
    id: "signal-2",
    providerId: "provider-2",
    symbol: "ETH/USDT",
    side: "sell",
    entryPrice: 3200,
    stopLoss: 3350,
    takeProfit: 2900,
    description: "Bearish divergence on RSI",
    timestamp: formatDate(new Date(Date.now() - 7200000)),
    status: "closed",
    closePrice: 2950,
    pnl: 250,
    closedAt: formatDate(new Date(Date.now() - 1800000)),
    createdAt: formatDate(new Date(Date.now() - 7200000)),
    updatedAt: formatDate(new Date(Date.now() - 1800000))
  },
  {
    id: "signal-3",
    providerId: "provider-1",
    symbol: "EURUSD",
    side: "buy",
    entryPrice: 1.0850,
    stopLoss: 1.0800,
    takeProfit: 1.0950,
    description: "Breakout from resistance level",
    timestamp: formatDate(new Date(Date.now() - 10800000)),
    status: "active",
    createdAt: formatDate(new Date(Date.now() - 10800000)),
    updatedAt: formatDate(new Date(Date.now() - 10800000))
  }
];

// Get all trade signals
export const getAllTradeSignals = async (req: Request, res: Response) => {
  try {
    // Return sample data
    return res.status(200).json(sampleTradeSignals);
  } catch (error) {
    console.error('Error fetching trade signals:', error);
    return res.status(500).json({ error: 'Failed to fetch trade signals' });
  }
};

// Get trade signals by provider
export const getTradeSignalsByProvider = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    
    // Filter sample data by providerId
    const filteredSignals = sampleTradeSignals.filter(
      signal => signal.providerId === providerId
    );
    
    return res.status(200).json(filteredSignals);
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
      timestamp: formatDate(),
      status: 'active',
      createdAt: formatDate(),
      updatedAt: formatDate()
    };
    
    // In a real application, this would save to the database
    // Here, we just simulate a successful creation
    
    return res.status(201).json(newSignal);
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
    
    // Find the signal in our mock data
    const signalIndex = sampleTradeSignals.findIndex(signal => signal.id === id);
    
    if (signalIndex === -1) {
      return res.status(404).json({ error: 'Trade signal not found' });
    }
    
    // Create updated signal
    const updatedSignal = {
      ...sampleTradeSignals[signalIndex],
      status,
      updatedAt: formatDate()
    };
    
    // Add close-specific fields if status is closed
    if (status === 'closed') {
      updatedSignal.closePrice = closePrice;
      updatedSignal.pnl = pnl || 0;
      updatedSignal.closedAt = formatDate();
    }
    
    // In a real application, this would update the database
    // Here, we just return the updated signal
    
    return res.status(200).json(updatedSignal);
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
    
    // Verify the signal exists in sample data
    const signal = sampleTradeSignals.find(signal => signal.id === signalId);
    
    if (!signal) {
      return res.status(404).json({ error: 'Trade signal not found' });
    }
    
    // Log the copy action
    const copyLog = {
      id: generateId(),
      userId,
      signalId,
      timestamp: formatDate(),
      autoExecute: autoExecute || false,
      executionStatus: autoExecute ? 'pending' : 'manual',
      createdAt: formatDate(),
      updatedAt: formatDate()
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