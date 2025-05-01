/**
 * Webhook Service
 * 
 * Responsible for sending notifications to external services like Discord, Slack, etc.
 * This service handles formatting and delivery of messages.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { MCPServer } from '../core/mcp-server';
import { TradeSignal } from '../types/trade-signal';
import { TradeRecord } from '../services/user-profile-service';

// Discord webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1366872425350037625/Tk_tIqARv4jJAGBu5298r1YC64lxPQZyR9uG67TD-OFt__9p1T4IiH42m8KVMpgUiuZX';

/**
 * Webhook Service
 */
export class WebhookService {
  private static instance: WebhookService;
  private mcp: MCPServer;
  private initialized: boolean = false;
  private errorCount: number = 0;
  private lastErrorTime: number = 0;
  
  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    console.log('Webhook Service initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService(mcp);
    }
    return WebhookService.instance;
  }
  
  // Track if we've already sent an initialization message to Discord
  private static hasInitializedBefore: boolean = false;
  
  // Store the last initialization time in a file to persist across restarts
  private readonly INIT_MARKER_FILE = './data/webhook-init-marker.json';
  private readonly INIT_COOLDOWN_HOURS = 12; // Only send the init message once per 12 hours
  
  /**
   * Check if we've sent an initialization message recently
   * This uses the filesystem to persist the state across server restarts
   */
  private async hasInitializedRecently(): Promise<boolean> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Create directory if it doesn't exist
      const dir = path.dirname(this.INIT_MARKER_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Check if the marker file exists
      if (fs.existsSync(this.INIT_MARKER_FILE)) {
        const data = fs.readFileSync(this.INIT_MARKER_FILE, 'utf8');
        const marker = JSON.parse(data);
        
        // Check if the last initialization was within the cooldown period
        const lastInit = new Date(marker.lastInitTime);
        const now = new Date();
        const hoursSinceLastInit = (now.getTime() - lastInit.getTime()) / (1000 * 60 * 60);
        
        console.log(`Last webhook initialization was ${hoursSinceLastInit.toFixed(2)} hours ago. Cooldown: ${this.INIT_COOLDOWN_HOURS} hours.`);
        return hoursSinceLastInit < this.INIT_COOLDOWN_HOURS;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking webhook initialization status:', error);
      // If we can't check, assume we haven't initialized to be safe
      return false;
    }
  }
  
  /**
   * Record that we've sent an initialization message
   */
  private async recordInitialization(): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Create directory if it doesn't exist
      const dir = path.dirname(this.INIT_MARKER_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the current time to the marker file
      const marker = {
        lastInitTime: new Date().toISOString(),
        serverInstanceId: Math.random().toString(36).substring(2, 15)
      };
      
      fs.writeFileSync(this.INIT_MARKER_FILE, JSON.stringify(marker, null, 2));
      console.log(`Recorded webhook initialization time: ${marker.lastInitTime}`);
    } catch (error) {
      console.error('Error recording webhook initialization:', error);
    }
  }

  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    try {
      // Use the file-based check to see if we've initialized recently
      const recentlyInitialized = await this.hasInitializedRecently();
      
      // Only send test message if we haven't initialized recently
      if (!recentlyInitialized) {
        console.log('No recent initialization detected, sending Discord initialization message');
        await this.testDiscordWebhook();
        WebhookService.hasInitializedBefore = true;
        await this.recordInitialization();
      } else {
        console.log('Webhook Service already initialized recently, skipping Discord test message');
      }
      
      this.initialized = true;
      this.errorCount = 0;
      console.log('Webhook Service fully initialized');
    } catch (error) {
      console.error('Error initializing Webhook Service:', error);
      this.initialized = false;
      this.errorCount++;
      this.lastErrorTime = Date.now();
    }
  }
  
  /**
   * Test Discord webhook with a simple message
   * Only sends the initialization message once per server session
   */
  private async testDiscordWebhook(): Promise<boolean> {
    try {
      console.log('Sending first-time initialization message to Discord');
      const testMessage = {
        content: null,
        embeds: [
          {
            title: '🔔 Trade Hybrid Notification System Active',
            description: 'The Trade Hybrid webhook notification system is now online and ready to deliver trading signals and alerts.',
            color: 3447003, // Blue color
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Trade Hybrid | MCP Server'
            }
          }
        ]
      };
      
      const response = await axios.post(DISCORD_WEBHOOK_URL, testMessage);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Error testing Discord webhook:', error);
      return false;
    }
  }
  
  /**
   * Send a new signal alert to Discord
   */
  public async sendSignalAlert(signal: TradeSignal): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Webhook Service not initialized, skipping signal alert');
      return false;
    }
    
    try {
      // Format emoji based on signal type
      let directionEmoji = signal.type === 'buy' ? '🟢' : '🔴';
      let signalTypeText = signal.type === 'buy' ? 'BUY' : 'SELL';
      
      // Format embed color based on signal type
      let embedColor = signal.type === 'buy' ? 5763719 : 15548997; // Green or Red
      
      // Format risk level
      let riskText = '';
      if (signal.risk !== undefined) {
        if (signal.risk <= 1) riskText = '⚠️ Low Risk';
        else if (signal.risk <= 2) riskText = '⚠️⚠️ Medium Risk';
        else riskText = '⚠️⚠️⚠️ High Risk';
      }
      
      // Calculate risk/reward ratio if possible
      let riskRewardText = '';
      if (signal.entry && signal.stopLoss && signal.takeProfit) {
        const entryPrice = signal.entry;
        const stopLoss = signal.stopLoss;
        const takeProfit = signal.takeProfit;
        
        if (signal.type === 'buy') {
          const risk = entryPrice - stopLoss;
          const reward = takeProfit - entryPrice;
          const ratio = reward / risk;
          riskRewardText = `Risk/Reward: 1:${ratio.toFixed(2)}`;
        } else {
          const risk = stopLoss - entryPrice;
          const reward = entryPrice - takeProfit;
          const ratio = reward / risk;
          riskRewardText = `Risk/Reward: 1:${ratio.toFixed(2)}`;
        }
      }
      
      // Create Discord message
      const message = {
        content: null,
        embeds: [
          {
            title: `${directionEmoji} New ${signalTypeText} Signal: ${signal.symbol}`,
            description: `**Source**: ${signal.source || 'Trade Hybrid'}\n**Timeframe**: ${signal.timeframe || 'Unknown'}\n${signal.notes ? `**Notes**: ${signal.notes}` : ''}`,
            color: embedColor,
            fields: [
              {
                name: 'Entry Price',
                value: `${signal.entry}`,
                inline: true
              },
              {
                name: 'Stop Loss',
                value: `${signal.stopLoss}`,
                inline: true
              },
              {
                name: 'Take Profit',
                value: `${signal.takeProfit}`,
                inline: true
              },
              {
                name: 'Risk Level',
                value: riskText,
                inline: true
              },
              {
                name: 'R/R Ratio',
                value: riskRewardText,
                inline: true
              },
              {
                name: 'Signal ID',
                value: `\`${signal.id}\``,
                inline: true
              }
            ],
            timestamp: signal.timestamp || new Date().toISOString(),
            footer: {
              text: 'Trade Hybrid | Trading Signals'
            }
          }
        ]
      };
      
      const response = await axios.post(DISCORD_WEBHOOK_URL, message);
      console.log(`Discord signal alert sent for ${signal.symbol} (${signal.type})`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Error sending Discord signal alert:', error);
      this.errorCount++;
      this.lastErrorTime = Date.now();
      return false;
    }
  }
  
  /**
   * Send a trade execution alert to Discord
   */
  public async sendTradeExecutionAlert(trade: TradeRecord): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Webhook Service not initialized, skipping trade execution alert');
      return false;
    }
    
    try {
      // Format emoji based on trade type
      let directionEmoji = trade.type === 'buy' ? '🟢' : '🔴';
      let tradeTypeText = trade.type === 'buy' ? 'BUY' : 'SELL';
      
      // Format embed color based on trade type
      let embedColor = trade.type === 'buy' ? 5763719 : 15548997; // Green or Red
      
      // Create Discord message
      const message = {
        content: null,
        embeds: [
          {
            title: `${directionEmoji} Trade Executed: ${trade.symbol} ${tradeTypeText}`,
            description: `A trade has been executed for user \`${trade.userId}\` via broker \`${trade.brokerId}\`${trade.notes ? `\n\n**Notes**: ${trade.notes}` : ''}`,
            color: embedColor,
            fields: [
              {
                name: 'Quantity',
                value: `${trade.quantity}`,
                inline: true
              },
              {
                name: 'Entry Price',
                value: `${trade.entryPrice}`,
                inline: true
              },
              {
                name: 'Entry Time',
                value: `${new Date(trade.entryDate).toLocaleString()}`,
                inline: true
              },
              {
                name: 'Stop Loss',
                value: trade.stopLoss ? `${trade.stopLoss}` : 'N/A',
                inline: true
              },
              {
                name: 'Take Profit',
                value: trade.takeProfit ? `${trade.takeProfit}` : 'N/A',
                inline: true
              },
              {
                name: 'Trade ID',
                value: `\`${trade.id}\``,
                inline: true
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Trade Hybrid | Trade Execution'
            }
          }
        ]
      };
      
      const response = await axios.post(DISCORD_WEBHOOK_URL, message);
      console.log(`Discord trade execution alert sent for ${trade.symbol} (${trade.type})`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Error sending Discord trade execution alert:', error);
      this.errorCount++;
      this.lastErrorTime = Date.now();
      return false;
    }
  }
  
  /**
   * Send a trade closed alert to Discord
   */
  public async sendTradeClosedAlert(trade: TradeRecord): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Webhook Service not initialized, skipping trade closed alert');
      return false;
    }
    
    try {
      // Determine if the trade was profitable
      const isProfit = trade.profitLoss > 0;
      const profitEmoji = isProfit ? '💰' : '📉';
      
      // Format embed color based on profit/loss
      let embedColor = isProfit ? 5763719 : 15548997; // Green or Red
      
      // Format profit/loss percentage if possible
      let plPercentage = '';
      if (trade.entryPrice && trade.exitPrice) {
        if (trade.type === 'buy') {
          const percent = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
          plPercentage = `(${percent.toFixed(2)}%)`;
        } else {
          const percent = ((trade.entryPrice - trade.exitPrice) / trade.entryPrice) * 100;
          plPercentage = `(${percent.toFixed(2)}%)`;
        }
      }
      
      // Create Discord message
      const message = {
        content: null,
        embeds: [
          {
            title: `${profitEmoji} Trade Closed: ${trade.symbol}`,
            description: `Trade for user \`${trade.userId}\` via broker \`${trade.brokerId}\` has been closed with a ${isProfit ? 'profit' : 'loss'} of ${trade.profitLoss.toFixed(2)} ${plPercentage}${trade.notes ? `\n\n**Notes**: ${trade.notes}` : ''}`,
            color: embedColor,
            fields: [
              {
                name: 'Direction',
                value: trade.type === 'buy' ? 'LONG' : 'SHORT',
                inline: true
              },
              {
                name: 'Entry Price',
                value: `${trade.entryPrice}`,
                inline: true
              },
              {
                name: 'Exit Price',
                value: trade.exitPrice ? `${trade.exitPrice}` : 'N/A',
                inline: true
              },
              {
                name: 'Entry Time',
                value: `${new Date(trade.entryDate).toLocaleString()}`,
                inline: true
              },
              {
                name: 'Exit Time',
                value: trade.exitDate ? `${new Date(trade.exitDate).toLocaleString()}` : 'N/A',
                inline: true
              },
              {
                name: 'Profit/Loss',
                value: `${isProfit ? '+' : ''}${trade.profitLoss.toFixed(2)} ${plPercentage}`,
                inline: true
              },
              {
                name: 'Trade ID',
                value: `\`${trade.id}\``,
                inline: true
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Trade Hybrid | Trade Closed'
            }
          }
        ]
      };
      
      const response = await axios.post(DISCORD_WEBHOOK_URL, message);
      console.log(`Discord trade closed alert sent for ${trade.symbol}`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Error sending Discord trade closed alert:', error);
      this.errorCount++;
      this.lastErrorTime = Date.now();
      return false;
    }
  }
  
  /**
   * Send a custom message to Discord
   */
  public async sendCustomMessage(title: string, message: string, color?: number): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Webhook Service not initialized, skipping custom message');
      return false;
    }
    
    try {
      const discordMessage = {
        content: null,
        embeds: [
          {
            title: title,
            description: message,
            color: color || 3447003, // Default blue color
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Trade Hybrid | Notification'
            }
          }
        ]
      };
      
      const response = await axios.post(DISCORD_WEBHOOK_URL, discordMessage);
      console.log(`Discord custom message sent: ${title}`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Error sending Discord custom message:', error);
      this.errorCount++;
      this.lastErrorTime = Date.now();
      return false;
    }
  }
  
  /**
   * Get service status
   */
  public getStatus(): any {
    return {
      initialized: this.initialized,
      errorCount: this.errorCount,
      lastErrorTime: this.lastErrorTime > 0 ? new Date(this.lastErrorTime).toISOString() : null
    };
  }
}

/**
 * Initialize the webhook service
 */
export function initializeWebhookService(mcp: MCPServer): WebhookService {
  const service = WebhookService.getInstance(mcp);
  service.initialize().catch(err => 
    console.error('Error initializing webhook service:', err)
  );
  return service;
}