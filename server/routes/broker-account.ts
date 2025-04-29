import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import { MCPServer } from '../mcp/core/mcp-server';

const router = express.Router();

// Get available broker instances from the MCP server
const getMcpBrokerService = () => {
  try {
    // Get the MCP server instance
    const mcp = MCPServer.getInstance();
    
    // Get the broker connection service from the MCP instance
    return mcp.brokerConnectionService;
  } catch (error) {
    console.error('Error getting broker connection service:', error);
    return null;
  }
};

// GET /api/broker-account
// Get account details for all connected brokers
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const brokerService = getMcpBrokerService();
    
    if (!brokerService) {
      return res.status(500).json({
        status: 'error',
        error: 'Broker service not available',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get all registered brokers
    const brokers = brokerService.getAllBrokers();
    const brokerDetailsPromises = [];
    
    // For each broker, get account details
    for (const [brokerId, broker] of brokers.entries()) {
      brokerDetailsPromises.push(
        broker.getAccountInfo()
          .then((accountInfo: any) => ({
            brokerId,
            connected: true,
            accountInfo
          }))
          .catch((error: Error) => ({
            brokerId,
            connected: false,
            error: error.message
          }))
      );
    }
    
    // Wait for all promises to resolve
    const brokerDetails = await Promise.all(brokerDetailsPromises);
    
    return res.json({
      status: 'success',
      brokers: brokerDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting broker account details:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to get broker account details',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/broker-account/:brokerId
// Get account details for a specific broker
router.get('/:brokerId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { brokerId } = req.params;
    const brokerService = getMcpBrokerService();
    
    if (!brokerService) {
      return res.status(500).json({
        status: 'error',
        error: 'Broker service not available',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get the specified broker
    const broker = brokerService.getBroker(brokerId);
    
    if (!broker) {
      return res.status(404).json({
        status: 'error',
        error: `Broker '${brokerId}' not found`,
        timestamp: new Date().toISOString()
      });
    }
    
    try {
      // Get account info for the broker
      const accountInfo = await broker.getAccountInfo();
      
      return res.json({
        status: 'success',
        brokerId,
        connected: true,
        accountInfo,
        timestamp: new Date().toISOString()
      });
    } catch (accountError) {
      return res.status(500).json({
        status: 'error',
        brokerId,
        connected: false,
        error: `Error getting account info for broker '${brokerId}'`,
        details: accountError instanceof Error ? accountError.message : String(accountError),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`Error getting broker account details for '${req.params.brokerId}':`, error);
    return res.status(500).json({
      status: 'error',
      error: `Failed to get broker account details for '${req.params.brokerId}'`,
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/broker-account/:brokerId/positions
// Get positions for a specific broker
router.get('/:brokerId/positions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { brokerId } = req.params;
    const brokerService = getMcpBrokerService();
    
    if (!brokerService) {
      return res.status(500).json({
        status: 'error',
        error: 'Broker service not available',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get the specified broker
    const broker = brokerService.getBroker(brokerId);
    
    if (!broker) {
      return res.status(404).json({
        status: 'error',
        error: `Broker '${brokerId}' not found`,
        timestamp: new Date().toISOString()
      });
    }
    
    try {
      // Get positions for the broker
      const positions = await broker.getOpenPositions();
      
      return res.json({
        status: 'success',
        brokerId,
        connected: true,
        positions,
        timestamp: new Date().toISOString()
      });
    } catch (positionsError) {
      return res.status(500).json({
        status: 'error',
        brokerId,
        connected: false,
        error: `Error getting positions for broker '${brokerId}'`,
        details: positionsError instanceof Error ? positionsError.message : String(positionsError),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`Error getting broker positions for '${req.params.brokerId}':`, error);
    return res.status(500).json({
      status: 'error',
      error: `Failed to get broker positions for '${req.params.brokerId}'`,
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

export default router;