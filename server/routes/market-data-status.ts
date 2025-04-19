import express, { Request, Response } from 'express';
import { checkAlpacaConnection } from '../services/alpaca-service';
import { getOandaClient } from '../services/oanda-service';
import axios from 'axios';
import OpenAI from 'openai';

const router = express.Router();

/**
 * Check if OpenAI API key is valid
 * @returns Promise<boolean>
 */
async function checkOpenAIConnection(): Promise<boolean> {
  try {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('OpenAI API key not found');
      return false;
    }

    // Initialize OpenAI with the API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Make a simple test request (models list is a lightweight call)
    const response = await openai.models.list();
    
    // If we get here, the API key is valid
    return response.data.length > 0;
  } catch (error) {
    console.error('Error checking OpenAI connection:', error);
    return false;
  }
}

/**
 * Check if TradingView webhook is properly configured
 * @returns Promise<boolean>
 */
async function checkTradingViewIntegration(): Promise<{ status: boolean, message: string }> {
  try {
    // Check for required configuration
    const webhookSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return { 
        status: false, 
        message: 'TradingView webhook secret not configured. Signals cannot be verified.' 
      };
    }
    
    // Additional checks could be added here, but without making external calls
    // since TradingView doesn't have a test endpoint we can use
    
    // For now, we'll just verify the webhook endpoint exists and is configured
    return { 
      status: true, 
      message: 'TradingView webhook endpoint configured and ready to receive signals.' 
    };
  } catch (error) {
    console.error('Error checking TradingView integration:', error);
    return { 
      status: false, 
      message: `Error checking TradingView integration: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// GET /api/market-data-status
// Check the connection status of all market data providers
router.get('/', async (req: Request, res: Response) => {
  const statuses: Record<string, any> = {};
  let overallStatus = 'operational';
  
  // Check Alpaca connection
  try {
    const alpacaConnected = await checkAlpacaConnection();
    statuses.alpaca = {
      status: alpacaConnected ? 'operational' : 'degraded',
      message: alpacaConnected ? 
        'Connected to Alpaca API' : 
        'Using fallback data - Alpaca API connection failed',
      type: alpacaConnected ? 'real' : 'simulated',
      timestamp: new Date().toISOString()
    };
    
    if (!alpacaConnected) {
      overallStatus = 'degraded';
    }
  } catch (error) {
    statuses.alpaca = {
      status: 'degraded',
      message: 'Using fallback data - Error checking Alpaca API',
      error: error instanceof Error ? error.message : String(error),
      type: 'simulated',
      timestamp: new Date().toISOString()
    };
    overallStatus = 'degraded';
  }
  
  // Check Oanda connection
  try {
    const oandaClient = getOandaClient();
    const accounts = await oandaClient.getAccounts();
    
    statuses.oanda = {
      status: accounts ? 'operational' : 'degraded',
      message: accounts ? 
        'Connected to Oanda API' : 
        'Using fallback data - Oanda API connection failed',
      type: accounts ? 'real' : 'simulated',
      timestamp: new Date().toISOString()
    };
    
    if (!accounts) {
      overallStatus = 'degraded';
    }
  } catch (error) {
    statuses.oanda = {
      status: 'degraded',
      message: 'Using fallback data - Error checking Oanda API',
      error: error instanceof Error ? error.message : String(error),
      type: 'simulated',
      timestamp: new Date().toISOString()
    };
    overallStatus = 'degraded';
  }
  
  // Check OpenAI connection
  try {
    const openaiConnected = await checkOpenAIConnection();
    statuses.openai = {
      status: openaiConnected ? 'operational' : 'unavailable',
      message: openaiConnected ? 
        'Connected to OpenAI API' : 
        'AI-powered analysis unavailable - OpenAI API connection failed',
      type: 'ai',
      timestamp: new Date().toISOString()
    };
    
    // Don't degrade overall status for AI, it's supplementary
  } catch (error) {
    statuses.openai = {
      status: 'unavailable',
      message: 'AI-powered analysis unavailable - Error checking OpenAI API',
      error: error instanceof Error ? error.message : String(error),
      type: 'ai',
      timestamp: new Date().toISOString()
    };
  }
  
  // Check TradingView integration
  try {
    const tradingViewStatus = await checkTradingViewIntegration();
    statuses.tradingview = {
      status: tradingViewStatus.status ? 'operational' : 'unavailable',
      message: tradingViewStatus.message,
      type: 'signals',
      timestamp: new Date().toISOString()
    };
    
    // TradingView affects features but not overall functionality
    if (!tradingViewStatus.status) {
      overallStatus = overallStatus === 'operational' ? 'degraded' : overallStatus;
    }
  } catch (error) {
    statuses.tradingview = {
      status: 'unavailable',
      message: 'Trading signals unavailable - Error checking TradingView integration',
      error: error instanceof Error ? error.message : String(error),
      type: 'signals',
      timestamp: new Date().toISOString()
    };
    overallStatus = overallStatus === 'operational' ? 'degraded' : overallStatus;
  }
  
  // Return the provider statuses
  return res.json({
    status: overallStatus,
    providers: statuses,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;