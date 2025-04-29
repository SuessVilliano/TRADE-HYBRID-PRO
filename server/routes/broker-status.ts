import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { MCPServer } from '../mcp/core/mcp-server';

const router = express.Router();

// GET /api/broker-status
// Get the status of all broker connections
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Try to get the MCP server instance
    let mcpServer;
    let usingMockData = false;
    
    try {
      mcpServer = MCPServer.getInstance();
    } catch (error) {
      console.warn('MCP server not available, using mock broker status data');
      usingMockData = true;
    }
    
    if (!usingMockData && mcpServer?.brokerConnectionService) {
      // Get the broker connection service from MCP
      const brokerService = mcpServer.brokerConnectionService;
      
      // Get all registered brokers
      const brokers = brokerService.getAllBrokers();
      const brokerStatuses: Record<string, { connected: boolean; status: string }> = {};
      
      // Build the response with broker statuses
      for (const [brokerId, broker] of brokers.entries()) {
        brokerStatuses[brokerId] = {
          connected: broker.isConnected(),
          status: broker.isConnected() ? 'connected' : 'disconnected'
        };
      }
      
      return res.json({
        status: 'success',
        brokers: brokerStatuses,
        timestamp: new Date().toISOString()
      });
    } else {
      // Provide mock broker status data when MCP is not available
      // This is helpful for UI development when the backend is not fully ready
      const mockBrokerStatuses = {
        alpaca: {
          connected: true,
          status: 'connected'
        },
        oanda: {
          connected: false,
          status: 'disconnected'
        },
        tradehybrid_system: {
          connected: true,
          status: 'connected'
        }
      };
      
      return res.json({
        status: 'success',
        brokers: mockBrokerStatuses,
        mock: true,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error getting broker status:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to get broker status',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

export default router;