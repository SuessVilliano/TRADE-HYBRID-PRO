/**
 * Test Python MCP Integration
 * 
 * This script simulates a Python MCP signal received in the format provided
 * in the OpenAI instructions and sends it to the Trade Hybrid platform.
 */

import axios from 'axios';

async function testPythonMCPIntegration() {
  try {
    console.log('Testing Python MCP integration...');
    
    // Simulate a signal from Python MCP
    const pythonMCPSignal = {
      symbol: 'BTC/USD',
      direction: 'buy',
      entry_price: 69500.00,
      stop_loss: 68700.00,
      take_profit_1: 70500.00,
      take_profit_2: 71500.00,
      take_profit_3: 72500.00,
      provider: 'Hybrid AI',
      timeframe: '10m',
      notes: 'Signal from Python MCP server',
      risk: 1.5,
      max_lifespan_minutes: 240
    };
    
    console.log('Sending test signal to Trade Hybrid platform...');
    
    // Forward to Trade Hybrid
    const response = await axios.post('http://localhost:5000/api/webhooks/python-mcp', pythonMCPSignal);
    
    console.log('Response:', response.data);
    console.log('Python MCP integration test completed successfully!');
    
  } catch (error) {
    console.error('Error in Python MCP integration test:', error.response?.data || error.message);
  }
}

// Run the test
testPythonMCPIntegration();