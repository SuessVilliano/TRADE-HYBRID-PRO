import express from 'express';
import { brokerConnectionService } from '../lib/services/broker-connection-service';

const router = express.Router();

// Get all broker types
router.get('/broker-types', async (req, res) => {
  try {
    const brokerTypes = await brokerConnectionService.getBrokerTypes();
    res.json(brokerTypes);
  } catch (error: any) {
    console.error('Error getting broker types:', error);
    res.status(500).json({ error: error.message || 'Failed to get broker types' });
  }
});

// Get user's broker connections
router.get('/connections', async (req, res) => {
  try {
    // In a real app, you'd get the user ID from the session or token
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const connections = await brokerConnectionService.getUserBrokerConnections(userId);
    res.json(connections);
  } catch (error: any) {
    console.error('Error getting broker connections:', error);
    res.status(500).json({ error: error.message || 'Failed to get broker connections' });
  }
});

// Create a new broker connection
router.post('/connections', async (req, res) => {
  try {
    // In a real app, you'd get the user ID from the session or token
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const {
      brokerTypeId,
      name,
      isDemo,
      apiKey,
      apiSecret,
      passphrase,
      additionalConfig
    } = req.body;
    
    // Validate required fields
    if (!brokerTypeId || !name || !apiKey || !apiSecret) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await brokerConnectionService.createBrokerConnection(
      userId,
      brokerTypeId,
      name,
      isDemo,
      apiKey,
      apiSecret,
      passphrase,
      additionalConfig
    );
    
    res.status(201).json(connection);
  } catch (error: any) {
    console.error('Error creating broker connection:', error);
    res.status(500).json({ error: error.message || 'Failed to create broker connection' });
  }
});

// Update an existing broker connection
router.put('/connections/:id', async (req, res) => {
  try {
    // In a real app, you'd get the user ID from the session or token
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const connectionId = parseInt(req.params.id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }
    
    const updates = req.body;
    
    const connection = await brokerConnectionService.updateBrokerConnection(
      connectionId,
      userId,
      updates
    );
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json(connection);
  } catch (error: any) {
    console.error('Error updating broker connection:', error);
    res.status(500).json({ error: error.message || 'Failed to update broker connection' });
  }
});

// Delete a broker connection
router.delete('/connections/:id', async (req, res) => {
  try {
    // In a real app, you'd get the user ID from the session or token
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const connectionId = parseInt(req.params.id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }
    
    // Get the connection to check ownership
    const connection = await brokerConnectionService.getBrokerConnection(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    if (connection.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await brokerConnectionService.deleteBrokerConnection(connectionId);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting broker connection:', error);
    res.status(500).json({ error: error.message || 'Failed to delete broker connection' });
  }
});

// Test a broker connection
router.post('/connections/:id/test', async (req, res) => {
  try {
    // In a real app, you'd get the user ID from the session or token
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const connectionId = parseInt(req.params.id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }
    
    // Get the connection to check ownership
    const connection = await brokerConnectionService.getBrokerConnection(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    if (connection.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const isValid = await brokerConnectionService.validateConnection(connectionId);
    
    res.json({ isValid });
  } catch (error: any) {
    console.error('Error testing broker connection:', error);
    res.status(500).json({ error: error.message || 'Failed to test broker connection' });
  }
});

export default router;