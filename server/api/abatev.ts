import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory store for ABATEV connections
// In a production environment, this would be stored in a database
const abatevConnections = new Map<string, ABATEVConnection>();

// ABATEV connection interface
interface ABATEVConnection {
  id: string;
  userId: string;
  clientVersion: string;
  features: string[];
  supportedBrokers: string[];
  status: 'connected' | 'disconnected' | 'error';
  connectedAt: Date;
  lastActivityAt: Date;
}

// Get all active ABATEV connections
router.get('/', (req, res) => {
  try {
    // Get userId from session or use a demo userId
    const userId = req.session?.userId || 'demo-user-123';
    
    // Get all connections for this user
    const userConnections = Array.from(abatevConnections.values())
      .filter(conn => conn.userId === userId)
      .map(conn => ({
        id: conn.id,
        status: conn.status,
        connectedAt: conn.connectedAt,
        lastActivityAt: conn.lastActivityAt,
        features: conn.features,
        supportedBrokers: conn.supportedBrokers
      }));
    
    res.json({ connections: userConnections });
  } catch (error) {
    console.error('Error getting ABATEV connections:', error);
    res.status(500).json({ error: 'Failed to get ABATEV connections' });
  }
});

// Connect to ABATEV
router.post('/connect', (req, res) => {
  try {
    // Get userId from session or use a demo userId
    const userId = (req.session?.userId || 'demo-user-123').toString();
    
    // Get connection details from request body
    const { clientVersion, features, supportedBrokers } = req.body;
    
    // Generate a connection ID
    const connectionId = crypto.randomBytes(16).toString('hex');
    
    // Create a new connection
    const connection: ABATEVConnection = {
      id: connectionId,
      userId,
      clientVersion: clientVersion || '1.0.0',
      features: features || [],
      supportedBrokers: supportedBrokers || [],
      status: 'connected',
      connectedAt: new Date(),
      lastActivityAt: new Date()
    };
    
    // Store the connection
    abatevConnections.set(connectionId, connection);
    
    console.log(`ABATEV connected: ${connectionId} for user ${userId}`);
    
    // Return connection details
    res.status(200).json({
      connectionId,
      status: 'connected',
      message: 'Successfully connected to ABATEV protocol'
    });
  } catch (error) {
    console.error('Error connecting to ABATEV:', error);
    res.status(500).json({ error: 'Failed to connect to ABATEV protocol' });
  }
});

// Disconnect from ABATEV
router.post('/disconnect', (req, res) => {
  try {
    // Get userId from session or use a demo userId
    const userId = (req.session?.userId || 'demo-user-123').toString();
    
    // Get connection ID from request body
    const { connectionId } = req.body;
    
    if (!connectionId) {
      return res.status(400).json({ error: 'Connection ID is required' });
    }
    
    // Get the connection
    const connection = abatevConnections.get(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    // Check if the connection belongs to the user
    if (connection.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update connection status
    connection.status = 'disconnected';
    connection.lastActivityAt = new Date();
    
    // Store the updated connection
    abatevConnections.set(connectionId, connection);
    
    console.log(`ABATEV disconnected: ${connectionId} for user ${userId}`);
    
    // Return success
    res.status(200).json({
      connectionId,
      status: 'disconnected',
      message: 'Successfully disconnected from ABATEV protocol'
    });
  } catch (error) {
    console.error('Error disconnecting from ABATEV:', error);
    res.status(500).json({ error: 'Failed to disconnect from ABATEV protocol' });
  }
});

// Check connection status
router.get('/status/:connectionId', (req, res) => {
  try {
    // Get userId from session or use a demo userId
    const userId = (req.session?.userId || 'demo-user-123').toString();
    
    // Get connection ID from request params
    const { connectionId } = req.params;
    
    if (!connectionId) {
      return res.status(400).json({ error: 'Connection ID is required' });
    }
    
    // Get the connection
    const connection = abatevConnections.get(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    // Check if the connection belongs to the user
    if (connection.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update last activity time
    connection.lastActivityAt = new Date();
    abatevConnections.set(connectionId, connection);
    
    // Return connection status
    res.status(200).json({
      connectionId,
      status: connection.status,
      connectedAt: connection.connectedAt,
      lastActivityAt: connection.lastActivityAt
    });
  } catch (error) {
    console.error('Error checking ABATEV status:', error);
    res.status(500).json({ error: 'Failed to check ABATEV status' });
  }
});

export default router;