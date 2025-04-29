/**
 * Express handler for TradingView webhooks
 * 
 * This module provides a bridge between the Express app and the MCP TradingView webhook handler
 */

import { Request, Response } from 'express';
import { MCPServer } from '../core/mcp-server';
import { TradingViewWebhookHandler } from './tradingview-webhook-handler';
import { SignalProcessor } from '../processors/signal-processor';
import { getUserWebhookByToken, processUserWebhook } from '../../api/user-webhooks';
import { processTradingViewWebhook } from '../../api/tradingview-webhooks';

/**
 * Handle TradingView webhook request
 * This creates a bridge between the old webhook system and the new MCP system
 */
export async function handleTradingViewWebhook(req: Request, res: Response, mcp: MCPServer): Promise<void> {
  console.log('[MCP] Received TradingView webhook request');
  
  try {
    const token = req.params.token || '';
    const payload = req.body;
    
    try {
      // For backward compatibility - pass to the old webhook handler first
      // This maintains existing functionality for dashboards, signals, etc.
      const result = await new Promise((resolve) => {
        // Call the original handler but don't await it since it sends its own response
        processTradingViewWebhook(req, res);
        // Always resolve true to prevent further processing
        resolve(true);
      });
      
      // If we got here, the old handler is processing the request
      return;
    } catch (oldHandlerError) {
      console.error('[MCP] Error in old webhook handler, falling back to MCP:', oldHandlerError);
      
      // Process through MCP system as a backup
      const signalProcessor = mcp.getProcessor('signal') as SignalProcessor;
      
      if (!signalProcessor) {
        console.error('[MCP] Signal processor not found');
        if (!res.headersSent) {
          res.status(500).json({ error: 'Signal processor not configured' });
        }
        return;
      }
      
      const handler = new TradingViewWebhookHandler(signalProcessor);
      const success = await handler.handleWebhook(payload);
      
      if (success) {
        if (!res.headersSent) {
          res.status(200).json({ success: true, message: 'Webhook processed by MCP' });
        }
      } else {
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to process webhook through MCP' });
        }
      }
    }
  } catch (error) {
    console.error('[MCP] Error handling TradingView webhook:', error);
    
    // Only send response if it hasn't been sent already
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  }
}