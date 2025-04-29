/**
 * Python MCP Integration Script
 * 
 * This script enables integration between the Trade Hybrid platform and the Python MCP signal server.
 * It provides functionality to:
 * 1. Forward signals from Python MCP to our platform
 * 2. Forward trade executions to Python MCP
 * 3. Sync active trades between systems
 * 
 * Usage:
 * node scripts/integrate-python-mcp.js [--test]
 */

import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';

// Configuration
const PYTHON_MCP_URL = process.env.PYTHON_MCP_URL || 'http://localhost:8000';
const TRADE_HYBRID_URL = process.env.TRADE_HYBRID_URL || 'http://localhost:3000';
const SERVER_PORT = process.env.INTEGRATION_PORT || 8080;

// Initialize Express app for receiving webhooks from Python MCP
const app = express();
app.use(bodyParser.json());

// Flag to run in test mode
const testMode = process.argv.includes('--test');

/**
 * Forward a signal from Python MCP to Trade Hybrid
 */
async function forwardSignalToTradeHybrid(signal) {
  try {
    console.log(`Forwarding signal for ${signal.symbol} to Trade Hybrid...`);
    
    // Convert Python MCP format to Trade Hybrid format if needed
    const tradeHybridSignal = {
      symbol: signal.symbol,
      type: signal.direction?.toLowerCase() === 'sell' ? 'sell' : 'buy',
      entry: parseFloat(signal.entry_price) || 0,
      stopLoss: parseFloat(signal.stop_loss) || 0,
      takeProfit: parseFloat(signal.take_profit_1 || signal.take_profit) || 0,
      source: signal.provider || 'Python MCP',
      timeframe: signal.timeframe || '1h',
      notes: signal.notes || `Signal from Python MCP: ${signal.provider || 'Unknown Provider'}`,
      risk: parseFloat(signal.risk) || 1
    };
    
    // Send to Trade Hybrid
    const response = await axios.post(`${TRADE_HYBRID_URL}/api/webhooks/python-mcp`, tradeHybridSignal);
    
    console.log('Signal forwarded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error forwarding signal to Trade Hybrid:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Forward a trade execution from Trade Hybrid to Python MCP
 */
async function forwardTradeExecutionToPythonMCP(trade) {
  try {
    console.log(`Forwarding trade execution for ${trade.symbol} to Python MCP...`);
    
    // Convert Trade Hybrid format to Python MCP format if needed
    const pythonMCPTrade = {
      symbol: trade.symbol,
      direction: trade.type?.toLowerCase(),
      entry_price: trade.entryPrice,
      quantity: trade.quantity,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      broker: trade.brokerId,
      user_id: trade.userId,
      trade_id: trade.id,
      notes: trade.notes || 'Trade from Trade Hybrid platform'
    };
    
    // Send to Python MCP
    const response = await axios.post(`${PYTHON_MCP_URL}/trade-signal`, pythonMCPTrade);
    
    console.log('Trade execution forwarded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error forwarding trade execution to Python MCP:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Sync active trades between Python MCP and Trade Hybrid
 */
async function syncActiveTrades() {
  try {
    console.log('Syncing active trades between platforms...');
    
    // Get active trades from Python MCP
    const pythonResponse = await axios.get(`${PYTHON_MCP_URL}/active-trades`);
    const pythonTrades = pythonResponse.data;
    
    console.log(`Found ${Object.keys(pythonTrades).length} active trades in Python MCP`);
    
    // TODO: Compare with Trade Hybrid active trades and reconcile differences
    // This would require implementing additional API endpoints in Trade Hybrid
    
    return pythonTrades;
  } catch (error) {
    console.error('Error syncing active trades:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get trade statistics from Python MCP
 */
async function getTradeStats() {
  try {
    console.log('Fetching trade statistics from Python MCP...');
    
    // Get trade stats from Python MCP
    const response = await axios.get(`${PYTHON_MCP_URL}/trade-stats`);
    const stats = response.data;
    
    console.log('Trade statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching trade statistics:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Refresh market data from Python MCP
 */
async function refreshMarketData() {
  try {
    console.log('Refreshing market data from Python MCP...');
    
    // Refresh data in Python MCP
    const response = await axios.get(`${PYTHON_MCP_URL}/refresh-data`);
    const prices = response.data;
    
    console.log('Market data refreshed:', prices);
    return prices;
  } catch (error) {
    console.error('Error refreshing market data:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Cancel a trade in Python MCP
 */
async function cancelTrade(symbol) {
  try {
    console.log(`Cancelling trade for ${symbol} in Python MCP...`);
    
    // Cancel trade in Python MCP
    const response = await axios.post(`${PYTHON_MCP_URL}/cancel-trade`, { symbol });
    
    console.log('Trade cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling trade:', error.response?.data || error.message);
    throw error;
  }
}

// Express routes for integration

// Receive signal from Python MCP
app.post('/signal', async (req, res) => {
  try {
    console.log('Received signal from Python MCP:', req.body);
    
    // Forward to Trade Hybrid
    const result = await forwardSignalToTradeHybrid(req.body);
    
    res.json({
      status: 'success',
      message: 'Signal forwarded to Trade Hybrid',
      result
    });
  } catch (error) {
    console.error('Error in signal webhook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process signal',
      error: error.message
    });
  }
});

// Receive trade execution from Trade Hybrid
app.post('/trade-execution', async (req, res) => {
  try {
    console.log('Received trade execution from Trade Hybrid:', req.body);
    
    // Forward to Python MCP
    const result = await forwardTradeExecutionToPythonMCP(req.body);
    
    res.json({
      status: 'success',
      message: 'Trade execution forwarded to Python MCP',
      result
    });
  } catch (error) {
    console.error('Error in trade execution webhook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process trade execution',
      error: error.message
    });
  }
});

// API endpoint to sync active trades
app.get('/sync', async (req, res) => {
  try {
    const result = await syncActiveTrades();
    
    res.json({
      status: 'success',
      message: 'Trades synced successfully',
      trades: result
    });
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync trades',
      error: error.message
    });
  }
});

// API endpoint to get trade stats
app.get('/stats', async (req, res) => {
  try {
    const stats = await getTradeStats();
    
    res.json({
      status: 'success',
      message: 'Trade statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get trade statistics',
      error: error.message
    });
  }
});

// API endpoint to refresh market data
app.get('/refresh', async (req, res) => {
  try {
    const prices = await refreshMarketData();
    
    res.json({
      status: 'success',
      message: 'Market data refreshed successfully',
      prices
    });
  } catch (error) {
    console.error('Error in refresh endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to refresh market data',
      error: error.message
    });
  }
});

// API endpoint to cancel a trade
app.post('/cancel', async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({
        status: 'error',
        message: 'Symbol is required'
      });
    }
    
    const result = await cancelTrade(symbol);
    
    res.json({
      status: 'success',
      message: `Trade for ${symbol} cancelled successfully`,
      result
    });
  } catch (error) {
    console.error('Error in cancel endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel trade',
      error: error.message
    });
  }
});

// Run tests if in test mode
async function runTests() {
  try {
    console.log('==== RUNNING INTEGRATION TESTS ====');
    
    // Test 1: Generate a test signal
    console.log('\nTest 1: Generate a test signal');
    
    const testSignal = {
      symbol: 'BTC/USD',
      direction: 'buy',
      entry_price: 69420.50,
      stop_loss: 68000.00,
      take_profit: 72000.00,
      provider: 'Solaris',
      timeframe: '5m',
      notes: 'This is a test signal from Python MCP',
      risk: 1.5
    };
    
    await forwardSignalToTradeHybrid(testSignal);
    
    // Test 2: Generate a test trade execution
    console.log('\nTest 2: Generate a test trade execution');
    
    const testTrade = {
      symbol: 'BTC/USD',
      type: 'buy',
      entryPrice: 69420.50,
      quantity: 0.5,
      stopLoss: 68000.00,
      takeProfit: 72000.00,
      brokerId: 'alpaca',
      userId: 'test_user',
      id: `test_trade_${Date.now()}`,
      notes: 'This is a test trade from Trade Hybrid'
    };
    
    await forwardTradeExecutionToPythonMCP(testTrade);
    
    // Test 3: Get trade stats
    console.log('\nTest 3: Get trade stats');
    await getTradeStats();
    
    // Test 4: Refresh market data
    console.log('\nTest 4: Refresh market data');
    await refreshMarketData();
    
    console.log('\n==== ALL TESTS COMPLETED SUCCESSFULLY ====');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Start the server
app.listen(SERVER_PORT, () => {
  console.log(`Integration server running on port ${SERVER_PORT}`);
  console.log(`Connecting Python MCP at ${PYTHON_MCP_URL} with Trade Hybrid at ${TRADE_HYBRID_URL}`);
  
  if (testMode) {
    console.log('Running in test mode - executing tests...');
    runTests().then(() => {
      console.log('Tests completed.');
    });
  }
});

// Periodic sync (every 5 minutes)
setInterval(() => {
  syncActiveTrades().catch(err => 
    console.error('Error in periodic sync:', err)
  );
}, 5 * 60 * 1000);

// Periodic data refresh (every 10 minutes)
setInterval(() => {
  refreshMarketData().catch(err => 
    console.error('Error in periodic data refresh:', err)
  );
}, 10 * 60 * 1000);