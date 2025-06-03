#!/usr/bin/env node

/**
 * Test Webhook for Trade Hybrid Platform
 * 
 * This script sends a test webhook payload to demonstrate real webhook processing
 * instead of mock "BUY Signal: UNKNOWN" messages.
 */

import http from 'http';

// Test payload with real trading data
const testPayload = {
  symbol: "EURUSD",
  side: "BUY",
  price: 1.0850,
  stop_loss: 1.0800,
  take_profit: 1.0950,
  strategy: "RSI Divergence", 
  timeframe: "1H",
  timestamp: new Date().toISOString(),
  provider: "TradingView Test"
};

// Function to send webhook
function sendWebhook() {
  const postData = JSON.stringify(testPayload);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhooks/tradingview',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Webhook Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      if (res.statusCode === 200) {
        console.log('✅ Webhook sent successfully - check the app for real notification!');
      } else {
        console.log('❌ Webhook failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Webhook Error: ${e.message}`);
    console.log('Note: Make sure the server is running on port 3000');
  });

  req.write(postData);
  req.end();
}

console.log('Sending test webhook with real trading data...');
console.log('Payload:', JSON.stringify(testPayload, null, 2));
console.log('---');

sendWebhook();