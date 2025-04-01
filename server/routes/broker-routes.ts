import express from 'express';
import { brokerConnectionService } from '../lib/services/broker-connection-service';
import { brokerAggregator } from '../lib/broker-aggregator';
import { db } from '../db';
import { brokerTypes } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Get all broker types
router.get('/types', async (req, res) => {
  try {
    const types = await brokerAggregator.getSupportedBrokerTypes();
    res.json(types);
  } catch (error: any) {
    console.error('Error getting broker types:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get broker type by ID
router.get('/types/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brokerType = await db.query.brokerTypes.findFirst({
      where: eq(brokerTypes.id, id)
    });
    
    if (!brokerType) {
      return res.status(404).json({ error: 'Broker type not found' });
    }
    
    res.json(brokerType);
  } catch (error: any) {
    console.error('Error getting broker type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test broker connection (without saving)
router.post('/test-connection', ensureAuthenticated, async (req: any, res) => {
  try {
    const { brokerTypeId, credentials, isLiveTrading } = req.body;
    
    if (!brokerTypeId || !credentials) {
      return res.status(400).json({ error: 'brokerTypeId and credentials are required' });
    }
    
    const result = await brokerAggregator.testConnection(
      brokerTypeId,
      credentials,
      isLiveTrading
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Error testing broker connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all user's broker connections
router.get('/connections', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connections = await brokerConnectionService.getBrokerConnections(userId);
    res.json(connections);
  } catch (error: any) {
    console.error('Error getting broker connections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new broker connection
router.post('/connections', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const { 
      brokerTypeId, 
      connectionName, 
      credentials, 
      isPrimary, 
      isLiveTrading,
      allowCopyTrading 
    } = req.body;
    
    if (!brokerTypeId || !connectionName || !credentials) {
      return res.status(400).json({ 
        error: 'brokerTypeId, connectionName and credentials are required' 
      });
    }
    
    // Test the connection first
    const testResult = await brokerAggregator.testConnection(
      brokerTypeId,
      credentials,
      isLiveTrading
    );
    
    if (!testResult.success) {
      return res.status(400).json({ 
        error: 'Connection test failed', 
        details: testResult.message 
      });
    }
    
    // Create the connection
    const connection = await brokerConnectionService.createBrokerConnection(
      userId,
      brokerTypeId,
      connectionName,
      credentials,
      {
        isPrimary: isPrimary || false,
        isLiveTrading: isLiveTrading || false,
        allowCopyTrading: allowCopyTrading || false
      }
    );
    
    res.status(201).json(connection);
  } catch (error: any) {
    console.error('Error creating broker connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific broker connection
router.get('/connections/:id', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    
    const connection = await brokerConnectionService.getBrokerConnection(connectionId, userId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Broker connection not found' });
    }
    
    res.json(connection);
  } catch (error: any) {
    console.error('Error getting broker connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a broker connection
router.put('/connections/:id', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    const updates = req.body;
    
    // If credentials are being updated, test them first
    if (updates.credentials) {
      const connection = await brokerConnectionService.getBrokerConnection(connectionId, userId);
      
      if (!connection) {
        return res.status(404).json({ error: 'Broker connection not found' });
      }
      
      const testResult = await brokerAggregator.testConnection(
        connection.brokerTypeId,
        updates.credentials,
        updates.isLiveTrading !== undefined ? updates.isLiveTrading : connection.isLiveTrading
      );
      
      if (!testResult.success) {
        return res.status(400).json({ 
          error: 'Connection test failed', 
          details: testResult.message 
        });
      }
    }
    
    const updatedConnection = await brokerConnectionService.updateBrokerConnection(
      connectionId,
      userId,
      updates
    );
    
    // Invalidate the broker service cache for this connection
    brokerAggregator.invalidateBrokerService(connectionId);
    
    res.json(updatedConnection);
  } catch (error: any) {
    console.error('Error updating broker connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a broker connection
router.delete('/connections/:id', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    
    await brokerConnectionService.deleteBrokerConnection(connectionId, userId);
    
    // Invalidate the broker service cache for this connection
    brokerAggregator.invalidateBrokerService(connectionId);
    
    res.status(204).end();
  } catch (error: any) {
    console.error('Error deleting broker connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get account information for a broker connection
router.get('/connections/:id/account', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    
    const accountInfo = await brokerAggregator.getAccountInfo(connectionId, userId);
    res.json(accountInfo);
  } catch (error: any) {
    console.error('Error getting account info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get positions for a broker connection
router.get('/connections/:id/positions', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    
    const positions = await brokerAggregator.getPositions(connectionId, userId);
    res.json(positions);
  } catch (error: any) {
    console.error('Error getting positions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order history for a broker connection
router.get('/connections/:id/orders', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    
    const orders = await brokerAggregator.getOrderHistory(connectionId, userId);
    res.json(orders);
  } catch (error: any) {
    console.error('Error getting order history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Place an order
router.post('/connections/:id/orders', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    const orderRequest = req.body;
    
    if (!orderRequest || !orderRequest.symbol || !orderRequest.quantity || !orderRequest.side || !orderRequest.type) {
      return res.status(400).json({ 
        error: 'Order must include symbol, quantity, side, and type' 
      });
    }
    
    const orderResponse = await brokerAggregator.placeOrder(
      connectionId,
      userId,
      orderRequest
    );
    
    res.status(201).json(orderResponse);
  } catch (error: any) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific order
router.get('/connections/:id/orders/:orderId', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    const orderId = req.params.orderId;
    
    const order = await brokerAggregator.getOrderStatus(connectionId, userId, orderId);
    res.json(order);
  } catch (error: any) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel an order
router.delete('/connections/:id/orders/:orderId', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    const orderId = req.params.orderId;
    
    const result = await brokerAggregator.cancelOrder(connectionId, userId, orderId);
    
    if (result) {
      res.status(204).end();
    } else {
      res.status(400).json({ error: 'Failed to cancel order' });
    }
  } catch (error: any) {
    console.error('Error canceling order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Close a position
router.post('/connections/:id/positions/:symbol/close', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    const symbol = req.params.symbol;
    const { quantity } = req.body;
    
    const result = await brokerAggregator.closePosition(
      connectionId,
      userId,
      symbol,
      quantity
    );
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error closing position:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a quote for a symbol
router.get('/connections/:id/quotes/:symbol', ensureAuthenticated, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const connectionId = parseInt(req.params.id);
    const symbol = req.params.symbol;
    
    const quote = await brokerAggregator.getQuote(connectionId, userId, symbol);
    res.json(quote);
  } catch (error: any) {
    console.error('Error getting quote:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;