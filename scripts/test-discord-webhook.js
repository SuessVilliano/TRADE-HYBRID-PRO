/**
 * Test Discord Webhook
 * 
 * This script tests the Discord webhook integration by sending a test signal
 * 
 * Usage:
 * - Run this script with Node.js: node scripts/test-discord-webhook.js
 */

const axios = require('axios');

async function main() {
  try {
    console.log('Sending test signal to Discord webhook...');
    
    // Create a test signal
    const testSignal = {
      symbol: 'BTC/USD',
      type: 'buy',
      entry: 69420.50,
      stopLoss: 68500.00,
      takeProfit: 71500.00,
      source: 'Solaris',
      timeframe: '5m',
      notes: 'This is a test signal from the Trade Hybrid platform',
      risk: 1.5
    };
    
    // Send to the webhook
    const response = await axios.post('http://localhost:3000/api/webhooks/tradingview-discord', testSignal);
    
    console.log('Response:', response.data);
    console.log('Signal test completed successfully!');
    
    // Test trade execution
    console.log('\nSending test trade execution to Discord webhook...');
    
    const testExecution = {
      id: `test_trade_${Date.now()}`,
      userId: 'test_user',
      brokerId: 'alpaca',
      symbol: 'BTC/USD',
      type: 'buy',
      quantity: 0.5,
      entryPrice: 69420.50,
      entryDate: new Date().toISOString(),
      stopLoss: 68500.00,
      takeProfit: 71500.00,
      notes: 'This is a test trade execution from the Trade Hybrid platform'
    };
    
    // Send to the webhook
    const executionResponse = await axios.post('http://localhost:3000/api/webhooks/trade-execution', testExecution);
    
    console.log('Response:', executionResponse.data);
    console.log('Trade execution test completed successfully!');
    
    // Test trade closed
    console.log('\nSending test trade closed to Discord webhook...');
    
    const testClosed = {
      ...testExecution,
      exitPrice: 71200.00,
      exitDate: new Date().toISOString(),
      profitLoss: (71200.00 - 69420.50) * 0.5 // (exit - entry) * quantity
    };
    
    // Send to the webhook
    const closedResponse = await axios.post('http://localhost:3000/api/webhooks/trade-closed', testClosed);
    
    console.log('Response:', closedResponse.data);
    console.log('Trade closed test completed successfully!');
    
    // Test custom message
    console.log('\nSending test custom message to Discord webhook...');
    
    const testCustom = {
      title: '🚀 Trade Hybrid Platform Update',
      message: 'The Trade Hybrid platform has been updated with new features:\n\n• Discord webhook notifications\n• Enhanced signal tracking\n• Improved trade management\n\nVisit tradehybrid.club for more information!',
      color: 3447003 // Blue color
    };
    
    // Send to the webhook
    const customResponse = await axios.post('http://localhost:3000/api/mcp/webhook/custom', testCustom);
    
    console.log('Response:', customResponse.data);
    console.log('Custom message test completed successfully!');
    
  } catch (error) {
    console.error('Error testing Discord webhook:', error.response?.data || error.message);
  }
}

main();